<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
class CategoryController extends ATplController {
    
    protected function getCsrfTokenDomain() {
        return 'category';
    }
    
    public function cgetAction() {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:Category');
        $data = $repository->findAll();
        return new Response($this->getJSon($data));
    }
    
    private function getJSon(array $data) {
        $list = '{"categories":[';
        $count = count($data);
        if ($count > 0) {
            for ($i = 0; $i < $count; ++$i) {
                if ($i != 0) {
                    $list .= ',';
                }
                $category = $data[$i]; 
                $list .= '{'
                        .'"id": "'.$category->getId().'",'
                        .'"name": "'.$category->getName().'"'
                        .'}'; 
            }
        }
        $list .= ']}';
        return $list;
    }
    
}
