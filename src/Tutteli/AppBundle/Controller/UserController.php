<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Tutteli\AppBundle\Entity\User;
use Tutteli\AppBundle\Form\UserType;


class UserController {

    public function cgetAction() {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:User');
        $data = $repository->findAll();
        $view = $this->view($data, 200)
            ->setTemplate("TutteliAppBundle:User:cget.html.twig")
            ->setTemplateVar('users');
        return $this->handleView($view);
    }

    public function newAction() {
        return $this->renderUserForm($this->getForm());
    }

    private function getForm(User $user = null) {
        return $this->createForm(new UserType(), $user, ['action' => $this->generateUrl('post_users')]);
    }

    private function renderUserForm(\Symfony\Component\Form\Form $form) {
        $view = $this->view($form, 200)
            ->setTemplate("TutteliAppBundle:User:new.html.twig")
            ->setTemplateVar("form");
        return $this->handleView($view);
    }

    public function cpostAction(Request $request) {
        $user = new User();
        $form = $this->createForm(new UserType(), $user);

        $form->handleRequest($request);

        if ($form->isValid()) {
            $password = $this->get('security.password_encoder')->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($password);
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
            return $this->redirectView(
                    $this->generateUrl('get_user', array('id' => $user->getId())), Codes::HTTP_CREATED);

        }

        return $this->renderUserForm($form);
    }

    public function getAction($id) {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:User');
        $data = $repository->findAll();
        $view = $this->view($data, 200)
            ->setTemplate("TutteliAppBundle:User:cget.html.twig")
            ->setTemplateVar('users');
        return $this->handleView($view);
    }

}
