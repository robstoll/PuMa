<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Listener;

use Doctrine\ORM\Event\LifecycleEventArgs;
use Defuse\Crypto\Crypto;
use Symfony\Component\HttpFoundation\Session\Session;
use Tutteli\AppBundle\Handler\AuthSuccessHandler;
use Tutteli\AppBundle\Entity\Category;
use Tutteli\AppBundle\Entity\Purchase;
use Tutteli\AppBundle\Entity\PurchasePosition;

class DbCryptoListener
{
    private $key;
    
    public function __construct(Session $session) {
        $this->key = $session->get(AuthSuccessHandler::SESSION_KEY_DATA_KEY);
    }
    
    public function preUpdate(LifecycleEventArgs $args) {
        $this->preSave($args);
    }
    
    public function prePersist(LifecycleEventArgs $args)
    {
        $this->preSave($args);
    }
    
    private function preSave(LifecycleEventArgs $args) {
        $entity = $args->getEntity();
        
        if ($entity instanceof Category) {
            /* @var $entity \Tutteli\AppBundle\Entity\Category */ 
            $entity->setName($this->encrypt($entity->getName()));
            return;
        } else if($entity instanceof Purchase) {
            /* @var $entity \Tutteli\AppBundle\Entity\Purchase */
            $entity->setTotal($this->encrypt($entity->getTotal()));
        } else if($entity instanceof PurchasePosition) {
            /* @var $entity \Tutteli\AppBundle\Entity\PurchasePosition */
            $entity->setExpression($this->encrypt($entity->getExpression()));
            $entity->setPrice($this->encrypt($entity->getPrice()));
            $entity->setNotice($this->encrypt($entity->getNotice()));
        }
    }
    
    public function postLoad(LifecycleEventArgs $args) {
        $entity = $args->getEntity();
        
        if ($entity instanceof Category) {
            /* @var $entity \Tutteli\AppBundle\Entity\Category */
            $entity->setName($this->decrypt($entity->getName()));
        } else if($entity instanceof Purchase) {
            /* @var $entity \Tutteli\AppBundle\Entity\Purchase */
            $entity->setTotal($this->decrypt($entity->getTotal()));
        } else if($entity instanceof PurchasePosition) {
            /* @var $entity \Tutteli\AppBundle\Entity\PurchasePosition */
            $entity->setExpression($this->decrypt($entity->getExpression()));
            $entity->setPrice($this->decrypt($entity->getPrice()));
            $entity->setNotice($this->decrypt($entity->getNotice()));
        }
    }
    
    private function encrypt($msg) {
        if ($msg !== null && $msg != "") {
            return Crypto::encrypt($msg, $this->key, true);
        }
        return null;
    }
    
    private function decrypt($resource) {
        if ($resource !== null) {
            $msg = stream_get_contents($resource);
            return Crypto::decrypt($msg, $this->key, true);
        }
        return null;
    }
}