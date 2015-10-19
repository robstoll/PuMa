<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class UserType extends AbstractType {

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options) {
        $builder
        ->add('username')
        ->add('plainPassword', 'repeated', array(
        'type' => 'password',
        'invalid_message' => 'The password fields must match.',
        'options' => array('attr' => array('class' => 'password-field')),
        'required' => true,
        'first_options' => array('label' => 'Password'),
        'second_options' => array('label' => 'Repeat Password'),
        ))
        ->add('email')
            ->add('role', 'choice', array('choices' => ['ROLE_USER' => 'user', 'ROLE_ADMIN' => 'admin']))
            ->add('save', 'submit', array('label' => 'Create User'));
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver) {
        $resolver->setDefaults(array(
            'data_class' => 'Tutteli\AppBundle\Entity\User',
            'csrf_protection' => false
        ));
    }

    /**
     * @return string
     */
    public function getName() {
        return 'tutteli_appbundle_user';
    }

}
