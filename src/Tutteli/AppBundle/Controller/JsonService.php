<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Translation\TranslatorInterface;

class JsonService {
    
    /**
     * @var \Symfony\Component\Translation\TranslatorInterface
     */
    private $translator;
    
    public function __construct(TranslatorInterface $translator) {
        $this->translator = $translator;
    }
    
    public function getJsonForEntities(
            Request $request, 
            callable $getLastUpdated, 
            callable $getEntities, 
            callable $getJsonForEntry, 
            $entityNamePlural) {
        
        $lastUpdatedEntity = $getLastUpdated();
        if ($lastUpdatedEntity == null) {
            return new Response('{"'.$entityNamePlural.'":[]}');
        }
    
        $updatedAt = $lastUpdatedEntity->getUpdatedAt();
        $response = $this->checkUpdatedAt($request, $updatedAt);
        if ($response === null) {
            $data = $getEntities();
            $jsonArray = $this->getJsonArray($data, $getJsonForEntry);
            $response = new Response(
                    '{'
                    .'"'.$entityNamePlural.'":'.$jsonArray
                    .$this->getMetaJsonRows($lastUpdatedEntity)
                    .'}');
            $response->setLastModified($updatedAt);
        }
        return $response;
    }

    private function checkUpdatedAt(Request $request, \DateTime $updatedAt){
        $response = new Response();
        $response->setLastModified($updatedAt);
        if (!$response->isNotModified($request)) {
            //is newer, need to generate a new response and cannot use the old one
            $response = null;
        }
        return $response;
    }
    
    public function getJsonArray($data, callable $getJsonForEntry) {
        $list = '';
        $count = count($data);
        if ($count > 0) {
            for ($i = 0; $i < $count; ++$i) {
                if ($i != 0) {
                    $list .= ',';
                }
                $list .= $getJsonForEntry($data[$i]);
            }
        }
        return '['.$list.']';
    }
    
    public function getFormattedDateTime($date) {
        $format =$this->translator->trans('general.dateTimeFormat.php');
        return $date->format($format);
    }
  
    public function getFormattedDate($date) {
        $format =$this->translator->trans('general.dateFormat.php');
        return $date->format($format);
    }
 
    public function getMetaJsonRows($entity) {
        return ',"updatedAt":"'.$this->getFormattedDateTime($entity->getUpdatedAt()).'"'
                .',"updatedBy": "'.$entity->getUpdatedBy()->getUsername().'"';
    }

}