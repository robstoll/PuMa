<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */


namespace Tutteli\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="accounting")
 * @ORM\Entity(repositoryClass="Tutteli\AppBundle\Entity\AccountingRepository")
 */
class Accounting 
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;
    
    /**
     * @ORM\Column(type="date")
     * @Assert\NotNull()
     */
    private $month;    
    
    /**
     * @ORM\Column(type="boolean")
     * @Assert\NotNull()
     */
    private $reopened;
    
    /**
     * @ORM\Column(type="datetime")
     */
    private $updatedAt;
    
    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="updated_by_user", nullable=false)
     */
    private $updatedBy;


    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set month
     *
     * @param \DateTime $month
     *
     * @return Accounting
     */
    public function setMonth($month)
    {
        $this->month = $month;

        return $this;
    }

    /**
     * Get month
     *
     * @return \DateTime
     */
    public function getMonth()
    {
        return $this->month;
    }

    /**
     * Set reopened
     *
     * @param boolean $reopened
     *
     * @return Accounting
     */
    public function setReopened($reopened)
    {
        $this->reopened = $reopened;

        return $this;
    }

    /**
     * Get reopened
     *
     * @return boolean
     */
    public function getReopened()
    {
        return $this->reopened;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return Accounting
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Set updatedBy
     *
     * @param \Tutteli\AppBundle\Entity\User $updatedBy
     *
     * @return Accounting
     */
    public function setUpdatedBy(\Tutteli\AppBundle\Entity\User $updatedBy)
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }

    /**
     * Get updatedBy
     *
     * @return \Tutteli\AppBundle\Entity\User
     */
    public function getUpdatedBy()
    {
        return $this->updatedBy;
    }
}
