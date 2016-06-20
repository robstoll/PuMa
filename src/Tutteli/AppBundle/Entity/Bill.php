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
 * @ORM\Table(name="bill")
 * @ORM\Entity(repositoryClass="Tutteli\AppBundle\Entity\BillRepository")
 */
class Bill 
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
     * @ORM\Column(type="binary")
     */
    private $amount;
    
    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(nullable=false)
     */
    private $userDebtor;
    
    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(nullable=false)
     */
    private $userCreditor;
    
    /**
     * @ORM\Column(type="boolean")
     * @Assert\NotNull()
     */
    private $payed;
    
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
     * Constructor
     */
    public function __construct()
    {
        $this->positions = new \Doctrine\Common\Collections\ArrayCollection();
    }

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
     * Set amount
     *
     * @param binary $amount
     *
     * @return Bill
     */
    public function setAmount($amount)
    {
        $this->amount = $amount;
    
        return $this;
    }
    
    /**
     * Get amount
     *
     * @return binary
     */
    public function getAmount()
    {
        return $this->amount;
    }

    /**
     * Set month
     *
     * @param \DateTime $month
     *
     * @return Bill
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
     * Set payed
     *
     * @param boolean $payed
     *
     * @return Bill
     */
    public function setPayed($payed)
    {
        $this->payed = $payed;
    
        return $this;
    }
    
    /**
     * Get payed
     *
     * @return boolean
     */
    public function isPayed()
    {
        return $this->payed;
    }
    
    
    
    /**
     * Set userDebtor
     *
     * @param \Tutteli\AppBundle\Entity\User $userDebtor
     *
     * @return Bill
     */
    public function setUserDebtor(\Tutteli\AppBundle\Entity\User $userDebtor)
    {
        $this->userDebtor = $userDebtor;
    
        return $this;
    }
    
    /**
     * Get userDebtor
     *
     * @return \Tutteli\AppBundle\Entity\User
     */
    public function getUserDebtor()
    {
        return $this->userDebtor;
    }
    
    /**
     * Set userCreditor
     *
     * @param \Tutteli\AppBundle\Entity\User $userCreditor
     *
     * @return Bill
     */
    public function setUserCreditor(\Tutteli\AppBundle\Entity\User $userCreditor)
    {
        $this->userCreditor = $userCreditor;
    
        return $this;
    }
    
    /**
     * Get userCreditor
     *
     * @return \Tutteli\AppBundle\Entity\User
     */
    public function getUserCreditor()
    {
        return $this->userCreditor;
    }    
    
    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return Bill
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
     * @return Bill
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
