<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormError;

class SecurityController extends Controller {

    public function loginAction(Request $request) {
        $authenticationUtils = $this->get('security.authentication_utils');

        $form = $this->createFormBuilder(array(
                // last username entered by the user
                'username' => $authenticationUtils->getLastUsername(),
            ))
            ->add('username', 'text', array('label' => 'login.username'))
            ->add('password', 'password', array('label' => 'login.password'))
            ->add('login', 'submit', array('label' => 'login.submit'))
            ->setAction($this->generateUrl('login_check'))
            ->getForm();

        $error = $authenticationUtils->getLastAuthenticationError();
        if ($error) {
            $msg = $this->get('translator')->trans($error->getMessage(), [],'security');
            $form->addError(new FormError($msg));
            
        }

        return $this->render(
                'TutteliAppBundle:Security:login.html.twig', array(
                'form' => $form->createView(),
                )
        );
    }

    public function loginCheckAction() {
        // this controller will not be executed,
        // as the route is handled by the Security system
    }

}
