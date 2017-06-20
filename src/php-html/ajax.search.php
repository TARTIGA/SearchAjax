<?php

require_once($_SERVER['DOCUMENT_ROOT']."/inc/start.php");
require_once($_SERVER['DOCUMENT_ROOT'].'/module/search/class.search.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/module/catalog/class.catalog.php');

//$_POST["referal"] = $_GET['referal'];

//$_POST["referal"] = 'aen,';

if(!empty($_POST["referal"])){

    $referal = trim(strip_tags(stripcslashes(htmlspecialchars($_POST["referal"]))));
    $referal =  Search::correct_query($referal);

    $data = Search::suggestions($referal);

    $quorum = 0;
    $word_arr = [];
    foreach($data as $word){
        $word_arr[] = implode('|', array_unique($word));
        $quorum ++;
    }

    $key_search = '('.implode(') (', $word_arr).')';
    $sphinx = Search::sphinx_connect();

    //print_r($key_search);

    $stop = 0;
    $data_array = [];
    for($i = $quorum; $i > 0; $i--) {
        $query = "
            SELECT
                weight() AS w,
                name, item_id, tree_id, group_name
            FROM products
            WHERE MATCH('\"$key_search\"/" . $quorum . "')
            GROUP BY
                group_merge_id
            ORDER BY
                w DESC
            ";

        $stmt = $sphinx->query($query);
        $result = $stmt->FETCHALL();

        $count = 0;

        foreach($result as $row){
            //print_r($row);
            $stop = 1;
            if($count < 5) {
                $data_array['categories'][$row['tree_id']] = ['group_name' => $row['group_name']];
            }
            if($count < 3) {
                $data_array['products'][$row['item_id']] = $row['name'];
            }
            $count++;
        }

        if($stop){ break;}
    }
}


$ret_str = '';
if(!empty($data_array['categories'])){
   $ret_str .= '<div class="category">'."\n";
   $ret_str .= '<div class="category_header">Категории</div>'."\n";

   $alias_array     = [];
   $alias           = 0;
   $query = "SELECT t1.item_tree_id, t1.`alias_item_tree_id`, t2.`name` 
             FROM `products_category_search_alias` t1, `moduleCatalog_tree` t2
             WHERE t2.`id` = t1.`alias_item_tree_id`";

   foreach(Db::select($query) as $row){
       $alias_array[$row['item_tree_id']] = ['alias_item_tree_id' => $row['alias_item_tree_id'],
           'alias_name' => $row['name']
       ];
   }

   foreach($data_array['categories'] as $key => $value){
      if(isset($alias_array[$key])){
          $alias = 1;
          $item_count = Catalog::countItemsByTreeId($alias_array[$key]['alias_item_tree_id']);
          $link = '';
          Search::full_tree($alias_array[$key]['alias_item_tree_id'], $link);
          $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.'"><div class="category_elem">'.$alias_array[$key]['alias_name'].'&nbsp;('.$item_count.')</div></a>'."\n";

          $item_count = Catalog::countItemsByTreeId($key);
          $link = '';
          Search::full_tree($key, $link);
          $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.'"><div class="category_elem">'.$value['group_name'].'&nbsp;('.$item_count.')</div></a>'."\n";
      }
      else{
          $item_count = Catalog::countItemsByTreeId($key);
          $link = '';
          Search::full_tree($key, $link);
          $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.'"><div class="category_elem">'.$value['group_name'].'&nbsp;('.$item_count.')</div></a>'."\n";
      }
   }

   if(count($data_array['categories']) == 1){

       $link = '';
       Search::full_tree($key, $link);

       $query = 'SELECT * FROM `moduleCatalog_tree_preset` WHERE `tree_id` = ?';
       foreach(Db::select($query, [$key]) as $row){

           $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.$row['link'].'"><div class="category_elem">'.$row['name'].'</div></a>'."\n";
       }
   }
   else{
      //проверим нет ли четкого попадания в пресет
       $query = 'SELECT * FROM `moduleCatalog_tree_preset` WHERE `name` = ?';
       foreach(Db::select($query, [$referal]) as $row){
           $link = '';
           Search::full_tree($row['tree_id'], $link);
           $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.$row['link'].'"><div class="category_elem">'.$row['name'].'</div></a>'."\n";
       }
   }
    $ret_str .= '</div>'."\n";
}

if(!empty($data_array['products'])){
   $ret_str .= '<div class="products">'."\n";
   $ret_str .= '<div class="products_header">Товары</div>'."\n";

   foreach($data_array['products'] as $key => $value){
       $query = 'SELECT * FROM `moduleCatalog_items` WHERE `id` = ?';
       $info = Db::selectOne($query, [$key]);


       $info = Catalog::itemExt_all($info);


       if (!empty($info['image']['src_need'])) {
           $photo = $info['image']['src_need'];
       }

       $tmp_id = '';
       $tmp_array = [];
       $color_box = '<div class="colors blockopener">';
       foreach ($info['color_var'] as $color_one) {

           if (!empty($color_one['color']['code'][1])) {
               $color_end = "#" . $color_one['color']['code'][1];
           } else {
               $color_end = "#" . $color_one['color']['code'][0];
           }

           if (!empty($data['all_filter_colors_code'])) {
               if (!in_array(implode(',', $color_one['color']['code']), $data['all_filter_colors_code'])) {
                   continue;
               }
           }
           ob_start();
           Template::helperColorBox([
               "color_start" => "#" . $color_one['color']['code'][0],
               "color_end" => $color_end,
               "id" => "item_" . $color_one['id'],
               "class" => "color",
               "title" => $color_one['color']['name']
           ]);
           $color_box .= ob_get_contents();
           ob_end_clean();
       }
       $color_box .= '</div>' . "\n";

       $link = '';
       Search::full_tree($info['tree_id'], $link);

       $ret_str .= '<a href="'.BASE_URL.'/catalog/'.$link.'/'.$info['id'].'">
                    <div class="products_elem">
                     <!--i class="elem__sale icon-sale"></i-->
                    <div class="elem_img">
                    
                    <img src="'.$photo.'" alt="'.$info['name'].'" class="img-responsive" >
                    </div>
                    <div class="elem_params">
                   
                        <div class="elem_name">'.$info['name'].'</div>
                        <div class="elem_article">'.$info['article'].'</div>
                        <div class="elem_color">'.$color_box.'</div>
                        <div class="elem_price">
                        <!--span class="price_old"><span class="line">старая цена</span> <span class="rub">&#8381;</span></span-->'
                        .$info['price'].' <span class="rub">&#8381;</span>
                        </div>
                    </div>
                    </div></a>'."\n";
   }
   $ret_str .= '</div>'."\n";
}

if($ret_str){
    $ret_str .= '<div class="footer">
                                <button type="submit" class="btn_search footer_button"  >Все результаты</button>
                                
                 </div>'."\n";
}
else{
    $ret_str .= '<div class="footer">
                                <span>ниче мы не нашли</span>
                                
                 </div>'."\n";
}


print $ret_str;



?>