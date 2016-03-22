<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Listener;

use Doctrine\ORM\Event\LifecycleEventArgs;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class DbLastUpdateListener
{
    /**
     * @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface
     */
    private $tokenStorage;
    
    public function __construct(TokenStorageInterface $tokenStorage) {
        $this->tokenStorage = $tokenStorage;
    } 
    
    public function preUpdate(LifecycleEventArgs $args) {
        $this->preSave($args);
    }
    
    public function prePersist(LifecycleEventArgs $args) {
        $this->preSave($args);
    }
    
    private function preSave(LifecycleEventArgs $args) {
        $entity = $args->getEntity();
        $entity->setUpdatedAt(new \DateTime());
        $entity->setUpdatedBy($this->tokenStorage->getToken()->getUser());
    }
    
}