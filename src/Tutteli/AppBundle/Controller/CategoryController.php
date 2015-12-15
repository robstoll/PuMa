<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Tutteli\AppBundle\Entity\Category;
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
    
    public function postAction(Request $request) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->createCategory($request);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function createCategory(Request $request) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $category = new Category();
            $this->mapCategory($category, $data);
            $validator = $this->get('validator');
            $errors = $validator->validate($category);
            if (count($errors) > 0) {
                $response = $this->getTranslatedValidationResponse($errors);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->persist($category);
                $em->flush();
                $response = $this->getCreateResponse($category->getId());
            }
        }
        return $response;
    }
    
    private function mapCategory(Category $category, array $data) {
        if (array_key_exists('name', $data)) {
            $category->setName($data['name']);
        }
    }
}
