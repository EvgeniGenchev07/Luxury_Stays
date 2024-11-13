<?php

try {
   /*echo "<script>console.log(0)</script>";*/
    require 'vendor/autoload.php';

    /*$email = new \SendGrid\Mail\Mail();
    echo "<script>console.log(1)</script>";
    $email->setFrom("zakg665@gmail.com",$_POST['name']);
    echo "<script>console.log(2)</script>";
    $email->setSubject($_POST['subject']);
    $email->addTo("gevgenig@gmail.com","Evgeni");
    $email->addContent("text/plain",$_POST['message']);
    $sendgrid = new \SendGrid(getenv("SENDGRIP_KEY"))S;
    $response = $sendgrid->send($email);*/
       $email = new \SendGrid\Mail\Mail();

        $email->setFrom("zakg665@gmail.com","difffssfr");
        $email->setSubject("is goodies");
        $email->addTo("zakg665@gmail.com","Evgeni");
        $email->addContent("text/plain","daddawd");
        $sendgrid = new \SendGrid('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');
        $response = $sendgrid->send($email);
        /*echo $response->statusCode() . "\n";
        print_r($response->headers());
        print $response->body() . "\n";*/
    die('MF000');
} catch (\Throwable $e) {
    die('MF254');
} catch (Exception $e) {
    die('MF255');
}