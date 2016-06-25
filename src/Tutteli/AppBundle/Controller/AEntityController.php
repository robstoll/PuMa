<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\HttpFoundation\JsonResponse;

abstract class AEntityController extends ATplController {
    
    
    protected abstract function getEntityNameSingular();
    protected abstract function getEntityNamePlural();
    /**
     * @return \Tutteli\AppBundle\Entity\ARepository
     */
    protected abstract function getRepository();
    protected abstract function getJson($entity);
    
    protected function getEntitynameFirstUpper() {
        return \ucfirst($this->getEntityNameSingular());
    }

    public function cgetAction(Request $request, $ending) {
        return $this->getHtmlForEntities($request, $ending, 'cget', [$this, 'loadEntities']);
    }
    
    protected function getHtmlForEntities(Request $request, $ending, $templateName, callable $getEntities=null, array $options = []) {
        return $this->getHtmlForThing('entities', $request, $ending, $templateName, $getEntities, $options);
    }
    
    protected function getHtmlForEntity(Request $request, $ending, $templateName, callable $getEntity=null, array $options = []) {
        return $this->getHtmlForThing('entity', $request, $ending, $templateName, $getEntity, $options);
    }
    
    public function newAction(Request $request, $ending) {
        return $this->getHtmlForEntity($request, $ending, 'new', null);
    }
    
    protected function editEntityAction(Request $request, $entityId, $ending) {
        return $this->getHtmlForEntity($request, $ending, 'edit', function() use ($entityId) {
            $entity = $this->loadEntity($entityId);
            if ($entity == null) {
                throw $this->createNotFoundException($this->getEntitynameFirstUpper().' with id '.$entityId. ' not found.');
            }
            return $entity;
        });
    }
    
    public function editTplAction(Request $request) {
        return $this->getHtmlForEntity($request, '.tpl', 'edit', function(){ return null; });
    }
    
    private function getHtmlForThing($thingName, Request $request, $ending, $templateName, callable $getThing=null, array $options) {
        $entityNameFirstUpper = $this->getEntityNameFirstUpper();
        $viewPath = '@TutteliAppBundle/Resources/views/'.$entityNameFirstUpper.'/'.$templateName.'.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
        
        if (!$response) {
            $thing = null;
            if ($ending != '.tpl' && $getThing != null) {
                $thing = $getThing();
            }
            $response = $this->render($viewPath, array_merge(array (
                    'notXhr' => $ending == '',
                    'error' => null,
                    $thingName => $thing
            ), $options));
        
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    protected function postEntity(Request $request) {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->{'create'.$this->getEntitynameFirstUpper()}($request);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    protected function putEntity(Request $request, $entityId) {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $entity = $this->loadEntity($entityId);
            if ($entity != null) {
                return $this->{'update'.$this->getEntitynameFirstUpper()}($request, $entity);
            } else {
                return $this->createNotFoundException($this->getEntitynameFirstUpper().' Not Found');
            }
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    public function cgetJsonAction(Request $request) {
        $repository = $this->getRepository();
        return $this->getJsonForEntities($request, [$repository, 'getLastUpdated'], [$repository, 'findAll']);
    }
    
    protected function getJsonForEntities(Request $request, callable $getLastUpdated, callable $getEntities) {
        return $this->get('tutteli.json_service')->getJsonForEntities(
                $request, 
                $getLastUpdated, 
                $getEntities, 
                function($entity) { return $this->getJson($entity); },
                $this->getEntityNamePlural());
    }   
    
    protected function getJsonArray($data, callable $getJsonForEntry) {
        return  $this->get('tutteli.json_service')->getJsonArray($data, $getJsonForEntry);
    }

    protected function getJsonForEntityAction($entityId) {
        $entity = $this->loadEntity($entityId);
        return new Response('{"'.$this->getEntityNameSingular().'":'.$this->getJson($entity).'}');
    }
    
    protected function loadEntity($id) {
        $repository = $this->getRepository();
        return $repository->find($id);
    }
    
    protected function loadEntities() {
        $repository = $this->getRepository();
        return $repository->findAll();
    }
    
    protected function getTranslatedValidationResponse(ConstraintViolationList $errorList) {
        $translator = $this->get('translator');
        $errors = array();
        foreach ($errorList as $error) {
            $errors[$error->getPropertyPath()] = $translator->trans($error->getMessage(), [], 'validators');
        }
        return new JsonResponse($errors, Response::HTTP_BAD_REQUEST);
    }
    
    protected function getValidationResponse(ConstraintViolationList $errorList) {
        $errors = array();
        foreach ($errorList as $error) {
            $errors[$error->getPropertyPath()] = $error->getMessage();
        }
        return new JsonResponse($errors, Response::HTTP_BAD_REQUEST);
    }
    
    protected function getCreateResponse($id){
        return new Response('{"id": "'.$id.'"}', Response::HTTP_CREATED);
    }
    
    protected function getFormattedDateTime($date) {
        return $this->get('tutteli.json_service')->getFormattedDateTime($date);
    }
    
    protected function getFormattedDate($date) {
        return $this->get('tutteli.json_service')->getFormattedDate($date);
    }
    
    protected function getMetaJsonRows($entity) {
        return $this->get('tutteli.json_service')->getMetaJsonRows($entity);
    }
    
}