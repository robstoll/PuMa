<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Entity;

/**
 * UserRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class PurchaseRepository extends \Doctrine\ORM\EntityRepository
{
    public function getPurchasesForMonthOfYear($month, $year) {
        $result = $this->getPurchasePositionsForMonthOfYear($month, $year);
        return $this->mapToPurchases($result);
    }
    
    private function getPurchasePositionsForMonthOfYear($month, $year) {
        $from = new \DateTime($year.'-'.$month.'-01T00:00:00');
        $to = new \DateTime($year.'-'.$month.'-01T00:00:00');
        $to->add(new \DateInterval('P1M'));
        $queryBuilder = $this->getEntityManager()->createQueryBuilder();
        return $queryBuilder->select('p', 'pp')
            ->from('TutteliAppBundle:PurchasePosition', 'pp')
            ->innerJoin('pp.purchase', 'p')
            ->where($queryBuilder->expr()->andX(
                $queryBuilder->expr()->gte('p.purchaseDate', ':from'),
                $queryBuilder->expr()->lt('p.purchaseDate', ':to')
                ))
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->getQuery()
            ->getResult();
    }
    
    public function mapToPurchases(array $result) {
        $purchases = [];
        /* @var $purchasePosition \Tutteli\AppBundle\Entity\PurchasePosition */
        foreach ($result as $purchasePosition) {
            $purchase = $purchasePosition->getPurchase();
            if (array_key_exists($purchase->getId(), $purchases)){
                $purchase = $purchases[$purchase->getId()];
            } else {
                $purchases[$purchase->getId()] = $purchase;
            }
            $purchase->addPosition($purchasePosition);
        }
        return $purchases;
    }
}
