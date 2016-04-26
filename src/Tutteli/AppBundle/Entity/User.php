<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="app_users")
 * @ORM\Entity(repositoryClass="Tutteli\AppBundle\Entity\UserRepository")
 * @UniqueEntity("username")
 */
class User implements UserInterface, \Serializable {

    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=25, unique=true)
     */
    private $username;

    /**
     * @Assert\Regex(pattern="/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{7,}/", message="login.password")
     */
    private $plainPassword;

    /**
     * @ORM\Column(type="string", length=64)
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=60, unique=true)
     * @Assert\Email(checkMX=true)
     */
    private $email;

    /**
     * @ORM\Column(type="string", length=20, nullable=true)
     */
    private $role;
    
    /**
     * @ORM\Column(type="binary")
     */
    private $dataKey;
    

    /**
     * @ORM\Column(type="boolean")
     * @Assert\NotNull()
     */
    private $isReal;
    
    /**
     * @ORM\Column(type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="updated_by_user", nullable=false)
     */
    private $updatedBy;
  
    
    public function __construct() {
        // may not be needed, see section on salt below
        // $this->salt = md5(uniqid(null, true));
    }
    
    public function getUsername() {
        return $this->username;
    }

    public function getSalt() {
        // you *may* need a real salt depending on your encoder
        // see section on salt below
        return null;
    }

    public function getPassword() {
        return $this->password;
    }

    public function getRoles() {
        if ($this->role != null) {
            return [$this->role];
        }
        return ['ROLE_USER'];
    }

    public function eraseCredentials() {
        
    }

    /** @see \Serializable::serialize() */
    public function serialize() {
        return serialize(array(
            $this->id,
            $this->username,
            $this->password,
            // see section on salt below
            // $this->salt,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized) {
        list (
            $this->id,
            $this->username,
            $this->password,
            // see section on salt below
            // $this->salt
            ) = unserialize($serialized);
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set username
     *
     * @param string $username
     *
     * @return User
     */
    public function setUsername($username) {
        $this->username = $username;

        return $this;
    }

    /**
     * Set password
     *
     * @param string $password
     *
     * @return User
     */
    public function setPassword($password) {
        $this->password = $password;

        return $this;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return User
     */
    public function setEmail($email) {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail() {
        return $this->email;
    }

    /**
     * Set role
     *
     * @param string $role
     *
     * @return User
     */
    public function setRole($role) {
        $this->role = $role;

        return $this;
    }

    /**
     * Get role
     *
     * @return string
     */
    public function getRole() {
        return $this->role;
    }

    public function getPlainPassword() {
        return $this->plainPassword;
    }

    public function setPlainPassword($newPassword) {
        $this->plainPassword = $newPassword;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return User
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
     * @return User
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


    /**
     * Set dataKey
     *
     * @param binary $dataKey
     *
     * @return User
     */
    public function setDataKey($dataKey)
    {
        $this->dataKey = $dataKey;

        return $this;
    }

    /**
     * Get dataKey
     *
     * @return binary
     */
    public function getDataKey()
    {
        return stream_get_contents($this->dataKey);
    }

    /**
     * Set isReal
     *
     * @param boolean $isReal
     *
     * @return User
     */
    public function setIsReal($isReal)
    {
        $this->isReal = $isReal;

        return $this;
    }

    /**
     * Get isRealUser
     *
     * @return boolean
     */
    public function isReal()
    {
        return $this->isReal;
    }
}
