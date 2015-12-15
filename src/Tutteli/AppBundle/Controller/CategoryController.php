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
use Symfony\Component\Validator\ConstraintViolation;
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
        $repository = $this->getCategoryRepository();
        return $repository->findAll();
    }
    
    private function getCategoryRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Category');
    }
    
    private function loadCategory($categoryId) {
        $repository = $this->getCategoryRepository();
        return $repository->find($categoryId);
    }
    
    public function cgetJsonAction() {
        $data = $this->loadCategories();
        return new Response($this->getJsonArray($data));
    }
    
    private function getJsonArray(array $data) {
        $list = '{"categories":[';
        $count = count($data);
        if ($count > 0) {
            for ($i = 0; $i < $count; ++$i) {
                if ($i != 0) {
                    $list .= ',';
                }
                $category = $data[$i]; 
                $list .= $this->getJson($category);
            }
        }
        $list .= ']}';
        return $list;
    }
    
    private function getJson(Category $category) {
        return  '{'
                .'"id": "'.$category->getId().'",'
                .'"name": "'.$category->getName().'"'
                .'}'; 
    }
    
    public function getJsonAction($categoryId) {
        $category = $this->loadCategory($categoryId);
        return new Response('{"category":'.$this->getJson($category).'}');
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
    
    public function editAction(Request $request, $categoryId, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        return $this->edit($request, $ending, function() use ($categoryId) {
            $category = $this->loadCategory($categoryId);
            if ($category == null) {
                throw $this->createNotFoundException('Category with id '.$categoryId. ' not found.');
            }
            return $category;
        });
    }
    
    public function editTplAction(Request $request) {
        return $this->edit($request, '.tpl', function(){return null;});
    }
    
    private function edit(Request $request, $ending, callable $getCategory) {
        $viewPath = '@TutteliAppBundle/Resources/views/Category/edit.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $category = $getCategory();
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'error' => null,
                    'category' => $category,
            ));
    
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    public function putAction(Request $request, $categoryId) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $category = $this->loadCategory($categoryId);
            if ($category != null) {
                return $this->updateCategory($request, $category);
            } else {
                return $this->createNotFoundException('Category Not Found');
            }
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function updateCategory(Request $request, Category $category) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $this->mapCategory($category, $data);
            $validator = $this->get('validator');
            $errors = $validator->validate($category);
            if (count($errors) > 0) {
                $response = $this->getTranslatedValidationResponse($errors);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->merge($category);
                $em->flush();
                $response = new Response('', Response::HTTP_NO_CONTENT);
            }
        }
        return $response;
    }
}
