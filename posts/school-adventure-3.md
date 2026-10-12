---
title: School adventure 3
date: 2025-05-16
tags: [lfi, wordpress, writeup]
excerpt: Bypass dell'autenticazione WordPress e upload bypass fino alla shell.
---

Dopo aver exploitato il servizio che trovate in questo [post](#blog/come-ho-bucato-un-servizio-della-mia-scuola) mi sono trovato con le credenziali del database come `root`, avendo sempre il permesso del docente responsabile ho voluto approfondire il codice di un servizio che permetteva di caricare (da parte dei docenti) il programma dell'anno scolastico appena finito: 
![image](posts/assets/Bk9Z3PF4Mg.png)

## Il codice
Il programma permetteva di selezionare una classe per poi passarlo come:
`<link>/vedi_cartella.php?azione=controlla&percorso=programmi&anno=2024-2025&classe=5B_INF`
Vedendo che i dati venivano passati come parametri di una GET ho voluto approfondire se lato server vi fosse una validazione (o whitelist) e ovviamente..  no.
Allora ho provato a inserire la classe della ragazza che mi piaceva: `../../../` e l'ho trovata!
![image](posts/assets/HJaYTPt4Gx.png)

Una volta trovata la struttura dei file tramite l'istruzione `LOAD_FILE` di SQL ho preso il codice del sito, vi evito lo yapping su come potevo cancellare qualsiasi file sul server tramite `delete_file.php` ed il resto del codice inutile per il nostro obbiettivo.

## Il problema
Ovviamente come sempre doveva esserci un problema, le prime tre righe di `upload.php` erano:
```php
<?php
  include("controllaAccesso.php");
  if ($accesso){
```

## accesso? bypassiamolo!

Sempre tramite SQL ho potuto leggere il codice di `controllaAccesso.php` 
```php
<?php 
    require('../wp-load.php' );
    if (0 !== $current_user->ID) {
         $accesso = true;
    }
    else{
        header("Location: ../wp-login.php");
    }
?>
```
Per chi non conoscesse php semplicemente controlla che sia loggato su wordpress o altrimenti ci rimanda al login di esso, ma ehi! noi possiamo leggere i file e come sappiamo esiste un file chiamato `wp-config.php` che contiene i segreti con cui vengono create le password.
Di fatti contiene:
```
define( 'AUTH_KEY',         '...' );
define( 'SECURE_AUTH_KEY',  '...' );
define( 'LOGGED_IN_KEY',    '...' );
define( 'NONCE_KEY',        '...' );
define( 'AUTH_SALT',        '...' );
define( 'SECURE_AUTH_SALT', '...' );
define( 'LOGGED_IN_SALT',   '...' );
define( 'NONCE_SALT',       '...' );
```
Come si può immaginare, è bastato un piccolo script in php ed ho potuto generare degli hash di password validi per loggarmi come un docente.

> ❗Piccolo disclaimer: le password dei docenti essendo degli hash non sono state compromesse

## L'exploit
### Arriviamo al punto, gioppy come hai bucato questo servizio?
Prendiamo il codice di upload.php dopo aver passato il check del login e skippando la definizione delle variabili pezzo per pezzo 

Qui costruisce una stringa con i nostri parametri presi della GET senza sanitizzazione fidandosi dell'utente (grazie<3)
```php
<?php
    ...    
      $target_dir = "./archivio_anni/".$anno."/".$percorso."/".$classe."/";
      $target_dir_file = $target_dir . basename($_FILES['fileselezionato']['name']);
    ...
```

Qui crea le cartelle se non esiste il path che gli abbiamo dato senza alcun controllo
```php
      ...
      if (file_exists("./archivio_anni/".$anno) == false) {
        mkdir($target_dir, 0777, true);
      } else if (file_exists("./archivio_anni/".$anno."/".$percorso."/") == false) {
        mkdir($target_dir, 0777, true);
      } else if (file_exists("./archivio_anni/".$anno."/".$percorso."/".$classe."/") == false) {
        mkdir($target_dir, 0777, true);
      }
      ...
```

Qui invece prende il file che gli abbiamo mandato e lo sposta nella cartella rimettendoci l'estensione che gli abbiamo dato noi (?)
```php
    ...  
    if (move_uploaded_file($_FILES['fileselezionato']['tmp_name'], $target_dir_file)) {    
        $ext = pathinfo($target_dir_file,PATHINFO_EXTENSION);
        if ($percorso == "relazioni"){
          rename($target_dir_file , $target_dir . $classe . "_Relazione_" . $materia . "." . $ext);
        }
        else if ($percorso == "programmi"){
          rename($target_dir_file , $target_dir . $classe . "_Programma_" . $materia . "." . $ext);
        }
    }
    ...
?> 
```
--- 
Bene, abbiamo abbiamo diviso il codice in tre parti e abbiamo trovato anche trovato almeno tre vulnerabilità!
1. Con la prima possiamo inserire il nostro file ovunque nel file system e (ad esempio) rimpiazzare il `wp-config.php` con qualcosa che vogliamo noi.
2. Con la seconda possiamo creare cartelle spazzatura in giro per il server
3. La terza è quella più interessante, il controllo dell'estensione viene fatta solo dal client
![image](posts/assets/SJdO4OK4zl.png)
```html
<input type="file" name="fileselezionato" id="upload1" class="hidden" accept=".pdf, .rtf, .doc, .docx" form="data_input" required="">
```
Lo dico io o l'avete già capito?
Esatto, inviando il file direttamente al php bypassiamo questo check, allora caricando la reverse shell di questo [post](#blog/school-adventure-2) siamo dentro!

## E quindi?
Una volta ottenuta la shell su questo server spinto dalla curiosità o cercato se ci fossero altri servizi da poter "testare" (spoiler: no).
Purtroppo per ragioni più grandi di me non posso dirvi cos'ho trovato ma l'url del server `riservata.itis.pr.it` può farvi intuire le cose che ho trovato.

> ❗Altro piccolo disclaimer: NESSUN dato personale di nessuno è stato compromesso
