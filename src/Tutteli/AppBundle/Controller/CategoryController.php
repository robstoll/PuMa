<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
class CategoryController extends ATplController {
    
    protected function getCsrfTokenDomain() {
        return 'category';
    }
    
    public function cgetAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        $viewPath = '@TutteliAppBundle/Resources/views/Category/cget.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $categories = null;
            if ($ending != '.tpl') {
                $categories = $this->loadCategories();
            }
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'categories' => $categories
            ));
    
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    private function loadCategories() {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:Category');
        return $repository->findAll();
    }
    
    public function cgetJsonAction() {
        $data = $this->loadCategories();
        return new Response($this->getJson($data));
    }
    
    private function getJson(array $data) {
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
 
    public function newAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        $viewPath = '@TutteliAppBundle/Resources/views/Category/new.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'error' => null,
            ));
    
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
}
