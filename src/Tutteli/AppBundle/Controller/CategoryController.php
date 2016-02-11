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
class CategoryController extends AEntityController {
    
    protected function getCsrfTokenDomain() {
        return 'category';
    }
    
    protected function getSingularEntityName() {
        return 'category';
    }
    
    protected function getPluralEntityName() {
        return 'categories';
    }
    
    protected function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Category');
    }
    
    protected function getJson($category) {
        return  '{'
                .'"id": "'.$category->getId().'"'
                .',"name": "'.$category->getName().'"'
                .$this->getMetaJsonRows($category)
                .'}';
    }

    public function cgetAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        return parent::cgetAction($request, $ending);
    }
    
    public function getJsonAction($categoryId) {
        return $this->getJsonForEntityAction($categoryId);
    }
    
    public function newAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        return parent::newAction($request, $ending);
    }
    
    public function editAction(Request $request, $categoryId, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        return $this->editEntityAction($request, $categoryId, $ending);
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
    
    
    
    public function putAction(Request $request, $categoryId) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
    
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $category = $this->loadEntity($categoryId);
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
