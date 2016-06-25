<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */


namespace Tutteli\AppBundle\Entity;

class AccountingRepository extends ARepository
{
    protected function getEntityIdentifier() {
        return 'TutteliAppBundle:Accounting';
    }
    
    public function getLastUpdatedForYear($year) {
        $result = $this->createQueryBuilderBillsForYear($year)
        ->orderBy('a.updatedAt', 'DESC')
        ->getQuery()
        ->setMaxResults(1)
        ->getResult();
        if (count($result) > 0) {
            return $result[0];
        }
        return null;
    }
    
    /**
     * @return \Doctrine\ORM\QueryBuilder
     */
    private function createQueryBuilderBillsForYear($year) {
        $from = new \DateTime($year.'-01-01T00:00:00');
        $to = new \DateTime($year.'-01-01T00:00:00');
        $to->add(new \DateInterval('P1Y'));
        $queryBuilder = $this->getEntityManager()->createQueryBuilder();
        return $queryBuilder->select('a')
        ->from($this->getEntityIdentifier(), 'a')
        ->where($queryBuilder->expr()->andX(
                $queryBuilder->expr()->gte('a.month', ':from'),
                $queryBuilder->expr()->lt('a.month', ':to')
                ))
                ->setParameter('from', $from)
                ->setParameter('to', $to);
    }
    
    public function getForYear($year) {
        return $this->createQueryBuilderBillsForYear($year)
        ->orderBy('a.month', 'DESC')
        ->getQuery()
        ->getResult();
    }
}