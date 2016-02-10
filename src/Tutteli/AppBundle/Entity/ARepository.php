<?php

namespace Tutteli\AppBundle\Entity;

abstract class ARepository extends \Doctrine\ORM\EntityRepository
{
    
    protected abstract function getEntityIdentifier();

    public function getLastUpdated() {
        $result = $this->getEntityManager()
        ->createQuery('SELECT e FROM '.$this->getEntityIdentifier().' e ORDER BY e.updatedAt DESC')
        ->setMaxResults(1)
        ->getResult();
        if (count($result) > 0) {
            return $result[0];
        }
        return null;
    }
}