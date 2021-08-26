//Cette fonction permet de générer un objet permettant de gérer le chronomètre
//Les seules méthodes publiques sont start() stop() et reset()
function generateTimer(){
  let Timer = {};
  let timer = null;
  let totalSeconds = 0;
  let active = false;

  function intToTime(number){
    let seconds = number % 60;
    let minutes = Math.floor(number / 60);
    return (minutes > 9 ? minutes : `0${minutes}`) + ":" + (seconds > 9 ? seconds : `0${seconds}`);
  }

  Timer.start = () => {
    if(!active){
      active = true;
      $("#timer").text(intToTime(totalSeconds));
      timer = setInterval(() => {
        $("#timer").text(intToTime(++totalSeconds));
      }, 1000);
    }
  }

  Timer.reset = () => {
    Timer.stop();
    totalSeconds = 0;
    $("#timer").text(intToTime(totalSeconds));
  }

  Timer.stop = () => {
    if(timer !== null){
      clearInterval(timer);
      timer = null;
      active = false;
    }
  }

  return Timer;
}

let Timer = generateTimer();
let victoryCheck = false;

//Permet de mélanger un tableau --> Est utilisé pour générer les mines de façon aléatoire
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

//Récupère le nombre de mines restantes depuis l'affichage visuel
function GetMines(){
	let txt = $('#minesR').text();
	let minesTxt = txt.substring(18);
	return +minesTxt;
}
//Permet de renvoyer l'id html correspondant à partir de la référence de la case dans le tableau d'objet
function ApiToId(apiRef, tableauObjet) {
  if(tableauObjet[apiRef]){
    return tableauObjet[apiRef].id;
  }
  else return false;
}
//Permet de renvoyer la référence de la case dans le tableau d'objet correspondant à partir l'id html de celle-ci
function IdToApi(id, nbrX) {
  //Exemple d'id html : #r6c7 #r15c9 #r9c15 #r26c12 -> 4 cas différents pour 3 longueurs différentes
  let x, y = 0;
  if (id.length === 4) {
    x = Number(id.substring(3, 4));
    y = Number(id.substring(1, 2));
  } else if (id.length === 5) {
    if (id.substring(2, 3) === "c") {
      x = Number(id.substring(3, 5));
      y = Number(id.substring(1, 2));
    } else {
      x = Number(id.substring(4, 5));
      y = Number(id.substring(1, 3));
    }
  } else {
    x = Number(id.substring(4, 6));
    y = Number(id.substring(1, 3));
  }
  let apiRef = (y - 1) * nbrX + x - 1;
  return apiRef;
}
//Permet de calculer et de renvoyer le nombre de mines autour d'une case
function calculMinesAutour(apiRef, tableauObjet, nbrX, nbrY) {
  let minesAutour = 0;
  if (tableauObjet[apiRef - 1] &&
    tableauObjet[apiRef - 1].mines &&
    apiRef % nbrX !== 0) {
    minesAutour++;
  }
  if (tableauObjet[apiRef + 1] &&
    tableauObjet[apiRef + 1].mines &&
    (apiRef + 1) % nbrX !== 0) {
    minesAutour++;
  }
  if (tableauObjet[apiRef - nbrX] &&
    tableauObjet[apiRef - nbrX].mines &&
    apiRef - nbrX >= 0) {
    minesAutour++;
  }
  if (tableauObjet[apiRef + nbrX] &&
    tableauObjet[apiRef + nbrX].mines &&
    apiRef + nbrX < nbrX * nbrY) {
    minesAutour++;
  }
  if (tableauObjet[apiRef - nbrX - 1] &&
    tableauObjet[apiRef - nbrX - 1].mines &&
    apiRef % nbrX !== 0 &&
    apiRef - nbrX >= 0) {
    minesAutour++;
  }
  if (tableauObjet[apiRef - nbrX + 1] &&
    tableauObjet[apiRef - nbrX + 1].mines &&
    (apiRef + 1) % nbrX !== 0 &&
    apiRef - nbrX >= 0) {
    minesAutour++;
  }
  if (tableauObjet[apiRef + nbrX - 1] &&
    tableauObjet[apiRef + nbrX - 1].mines &&
    apiRef % nbrX !== 0 &&
    apiRef + nbrX < nbrX * nbrY) {
    minesAutour++;
  }
  if (tableauObjet[apiRef + nbrX + 1] &&
    tableauObjet[apiRef + nbrX + 1].mines &&
    (apiRef + 1) % nbrX !== 0 &&
    apiRef + nbrX < nbrX * nbrY) {
    minesAutour++;
  }
  return minesAutour;
}
//Permet de calculer et de renvoyer le nombre de drapeaux autour d'une case
function calculFlagAutour(apiRef, tableauObjet, nbrX, nbrY) {
  let flagAutour = 0;
  if (tableauObjet[apiRef - 1] &&
    tableauObjet[apiRef - 1].status === 'flagged' &&
    apiRef % nbrX !== 0) {
    flagAutour++;
  }
  if (tableauObjet[apiRef + 1] &&
    tableauObjet[apiRef + 1].status === 'flagged' &&
    (apiRef + 1) % nbrX !== 0) {
    flagAutour++;
  }
  if (tableauObjet[apiRef - nbrX] &&
    tableauObjet[apiRef - nbrX].status === 'flagged' &&
    apiRef - nbrX >= 0) {
    flagAutour++;
  }
  if (tableauObjet[apiRef + nbrX] &&
    tableauObjet[apiRef + nbrX].status === 'flagged' &&
    apiRef + nbrX < nbrX * nbrY) {
    flagAutour++;
  }
  if (tableauObjet[apiRef - nbrX - 1] &&
    tableauObjet[apiRef - nbrX - 1].status === 'flagged' &&
    apiRef % nbrX !== 0 &&
    apiRef - nbrX >= 0) {
    flagAutour++;
  }
  if (tableauObjet[apiRef - nbrX + 1] &&
    tableauObjet[apiRef - nbrX + 1].status === 'flagged' &&
    (apiRef + 1) % nbrX !== 0 &&
    apiRef - nbrX >= 0) {
    flagAutour++;
  }
  if (tableauObjet[apiRef + nbrX - 1] &&
    tableauObjet[apiRef + nbrX - 1].status === 'flagged' &&
    apiRef % nbrX !== 0 &&
    apiRef + nbrX < nbrX * nbrY) {
    flagAutour++;
  }
  if (tableauObjet[apiRef + nbrX + 1] &&
    tableauObjet[apiRef + nbrX + 1].status === 'flagged' &&
    (apiRef + 1) % nbrX !== 0 &&
    apiRef + nbrX < nbrX * nbrY) {
    flagAutour++;
  }
  return flagAutour;
}
//Permet d'activer une case
function activerCase(apiRef, tableauObjet, nbrX, nbrY) {
  //Si la case à activer n'est pas un flag
  if (tableauObjet[apiRef] && tableauObjet[apiRef].status !== "flagged") {
    //On récupère son id
    let idCase = tableauObjet[apiRef].id;
    let minesAutour = 0;
    //Si la case est une mine
    if (tableauObjet[apiRef].mines) {
      Timer.stop();
      //On parcourt toutes les cases du tableau
      for (let i = 0; i < tableauObjet.length; i++) {
        let getId = tableauObjet[i].id;
        //Si on tombe sur une mine, on la révèle
        if (tableauObjet[i].mines) {
          if (tableauObjet[i].status !== 'flagged') {
            $('#' + getId)
              .css('background-image', 'url("img/bombrevealed.gif")');
          }
        }
        //Si on tombe sur une case flagged qui n'avait pas de mine, on indique qu'il n'y en avait pas
        if (tableauObjet[i].status === 'flagged' && !tableauObjet[i].mines) {
          $('#' + getId)
            .css('background-image', 'url("img/bombmisflagged.gif")');
        }
      }
      //On passe le background de la case activée en rouge
      $('#' + idCase)
        .css('background-image', 'url("img/bombdeath.gif")');
      //On désactive les écouteurs d'événements car c'est la fin de la partie
      $('.case')
        .off('click')
        .off('contextmenu');
      return 9;
    //Si la case n'est pas une mine
    } else {
      //calcul du nombre de mines autour
      minesAutour = calculMinesAutour(apiRef, tableauObjet, nbrX, nbrY);
      //affichage du contenu et désactivation du click droit et click gauche
      $('#' + idCase)
        .data('triggered', true);
      if (minesAutour === 8) {
        $('#' + idCase)
          .css('background-image', 'url("img/open8.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 7) {
        $('#' + idCase)
          .css('background-image', 'url("img/open7.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 6) {
        $('#' + idCase)
          .css('background-image', 'url("img/open6.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 5) {
        $('#' + idCase)
          .css('background-image', 'url("img/open5.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 4) {
        $('#' + idCase)
          .css('background-image', 'url("img/open4.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 3) {
        $('#' + idCase)
          .css('background-image', 'url("img/open3.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 2) {
        $('#' + idCase)
          .css('background-image', 'url("img/open2.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 1) {
        $('#' + idCase)
          .css('background-image', 'url("img/open1.gif")')
          .off('contextmenu')
          .off('click');
      } else if (minesAutour === 0) {
        $('#' + idCase)
          .css('background-image', 'url("img/open0.gif")')
          .off('contextmenu')
          .off('click');
      }
    }
    //S'il n'y a pas de mines autour -> on active les cases alentours -> potentielle réaction en chaîne
    if (minesAutour === 0) {
      //Si la case est sur le bord gauche du tableau
      if(apiRef % nbrX === 0){
        if(ApiToId(apiRef+nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef+nbrX+1, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX+1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX+1, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX+1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef+1, tableauObjet) &&
        $('#' + ApiToId(apiRef+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+1, tableauObjet, nbrX, nbrY);
        }
      }
      //Si la case est sur le bord droit du tableau
      else if((apiRef + 1) % nbrX === 0){
        if(ApiToId(apiRef+nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef+nbrX-1, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX-1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX-1, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX-1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-1, tableauObjet) &&
        $('#' + ApiToId(apiRef-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-1, tableauObjet, nbrX, nbrY);
        }
      }
      //Si la case est au centre
      else{
        //Bas
        if(ApiToId(apiRef+nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef+nbrX+1, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX+1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef+nbrX-1, tableauObjet) &&
        $('#' + ApiToId(apiRef+nbrX-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+nbrX-1, tableauObjet, nbrX, nbrY);
        }
        //Haut
        if(ApiToId(apiRef-nbrX, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX+1, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX+1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-nbrX-1, tableauObjet) &&
        $('#' + ApiToId(apiRef-nbrX-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-nbrX-1, tableauObjet, nbrX, nbrY);
        }
        //Côtés
        if(ApiToId(apiRef+1, tableauObjet) &&
        $('#' + ApiToId(apiRef+1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef+1, tableauObjet, nbrX, nbrY);
        }
        if(ApiToId(apiRef-1, tableauObjet) &&
        $('#' + ApiToId(apiRef-1, tableauObjet)).data('triggered') === false){
          activerCase(apiRef-1, tableauObjet, nbrX, nbrY);
        }
      }
    }
    //S'il y a autour de la case un nombre de mines allant de 1 à 7 inclus
    else if(minesAutour > 0 && minesAutour < 8){
      //Nouvel écouteur de click -> Permet de révéler les cases autour d'un nombre où on a flag le bon nombre de mines
      $('#' + idCase)
        .on('click', function(){
          //récupération des données
          let thisId = $(this).attr('id');
          let thisApiRef = IdToApi(thisId, nbrX);
          //Nombre de flag autour de la case
          let thisFlagAutour = calculFlagAutour(thisApiRef, tableauObjet, nbrX, nbrY);
          //Nombre de mines autour de la case
          let thisMinesAutour = calculMinesAutour(thisApiRef, tableauObjet, nbrX, nbrY);
          //Si le nombre de mines et de flag autour de la case est le même
          if(thisFlagAutour === thisMinesAutour){
            //Si la case est sur le bord de gauche
            let tableauCasesAutour = null;
            if(apiRef % nbrX === 0){
              tableauCasesAutour = [thisApiRef+nbrX, thisApiRef+nbrX+1, thisApiRef+1, thisApiRef-nbrX+1, thisApiRef-nbrX];
            }
            //Si la case est sur le bord de droit
            else if((apiRef + 1) % nbrX === 0){
              tableauCasesAutour = [thisApiRef+nbrX, thisApiRef-nbrX, thisApiRef-nbrX-1, thisApiRef-1, thisApiRef+nbrX-1];
            }
            else{
              tableauCasesAutour = [thisApiRef+nbrX, thisApiRef+nbrX+1, thisApiRef+1, thisApiRef-nbrX+1, thisApiRef-nbrX, thisApiRef-nbrX-1, thisApiRef-1, thisApiRef+nbrX-1];
            }
            //On active toutes les cases qui ne sont pas flag dans les cases autours
            for(let i=0; i<tableauCasesAutour.length; i++){
              if (tableauObjet[tableauCasesAutour[i]] &&
              tableauObjet[tableauCasesAutour[i]].status !== "flagged"){
                activerCase(tableauCasesAutour[i], tableauObjet, nbrX, nbrY);
                $('#' + idCase).off('click');
              }
            }
          }
        });
    }
    //Vérification de l'état de la partie pour savoir si le joueur a gagné
    if(!victoryCheck){
      let minesRestantes = GetMines();
      let victory = true;
      for(let i=0; i<tableauObjet.length; i++){
        if(!tableauObjet[i].mines && $('#' + ApiToId(i, tableauObjet)).data("triggered") === false){
          victory = false;
        }
      }
      if(victory){
        Timer.stop();
        for(let i=0; i<tableauObjet.length; i++){
          if(tableauObjet[i].mines && tableauObjet[i].status !== "flagged"){
            tableauObjet[i].status = "flagged";
            minesRestantes--;
            $('#' + ApiToId(i, tableauObjet))
              .css('background-image', 'url("img/bombflagged.gif")')
            $('#minesR')
              .text('Mines restantes : ' + minesRestantes);
          }
        }
        $('.case')
          .off('click')
          .off('contextmenu');
        $("#minesR")
          .text("Bien joué ! Vous avez gagné !");
        victoryCheck = true;
      }
    }
  }
}
//Création du tableau
function creerTableau(nbrX, nbrY, mines) {
  let basesApi = [];
  let minesCheck = [];
  let k = 0;
  let timerActif = false;
  victoryCheck = false;
  //On reset le chronomètre
  Timer.reset();
  //Placement du compteur de mines
  $('#minesR')
    .text('Mines restantes : ' + mines);
  //Création d'un tableau de la taille du nombre de case de la grille, comportant autant de 1 que de mines, le reste sera 0
  for (let i = 0; i < nbrX * nbrY; i++) {
    if (i < mines) {
      minesCheck[i] = 1;
    } else {
      minesCheck[i] = 0;
    }
  }
  //On mélange le tableau
  minesCheck = shuffle(minesCheck);
  //Création du tableau html
  $('#board')
    .append($('<table>'));
  //Création des rangées
  for (let i = 0; i < nbrY; i++) {
    let rowName = "row" + (i + 1);
    $('#board table')
      .append($('<tr>')
        .attr({
          'id': rowName,
          'class': 'row',
        })
      );
    for (let j = 0; j < nbrX; j++) {
      //Création de l'id des cases
      let caseName = "r" + (i + 1) + "c" + (j + 1);
      $('#board table tr:last')
        .append($('<td>')
          .attr({
            'id': caseName,
            'class': 'case',
            'data-triggered': false
          })
          .css({
            'background-image': 'url("img/blank.gif")',
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-size': 'cover'
          })
        );
      //Les mines sont placées à partir du tableau de 1 et de 0 qui a été mélangé
      // 1 = mine ; 0 = rien
      //La variable k est incrémentée à chaque placement de mine
      //La variable k a été initialisée hors de la boucle et n'est donc pas réinitialisée à chaque nouvelle rangée
      if (minesCheck[k] === 0) {
        basesApi[k] = {
          'id': caseName,
          'mines': false,
          'status': 'normal'
        };
        k++;
      } else {
        basesApi[k] = {
          'id': caseName,
          'mines': true,
          'status': 'normal'
        };
        k++;
      }
    }
  }
  $('.case')
    //Si on clique sur une case
    .on('click', function() {
      if(!timerActif) {
        Timer.start();
        timerActif = true;
      }
      let id = $(this).attr('id');
      let apiRef = IdToApi(id, nbrX);
      //On l'active (voir fonction activerCase() plus haut)
      activerCase(apiRef, basesApi, nbrX, nbrY);
    })
    //Si on clique droit sur une case
    .on("contextmenu", function() {
        let id = $(this).attr('id');
        let minesRestantes = GetMines();
        let apiRef = IdToApi(id, nbrX);
        //Si la case est normale
        if (basesApi[apiRef].status === 'normal') {
          //On la passe en flag
          basesApi[apiRef].status = 'flagged';
          minesRestantes--;
          $(this)
            .css('background-image', 'url("img/bombflagged.gif")')
            //On désactive son click pour éviter les miss click
            .off('click');
          //On met à jour le compteur de mines
          $('#minesR')
            .text('Mines restantes : ' + minesRestantes);
        //Si la case est flag
        } else if (basesApi[apiRef].status === 'flagged') {
          //On la passe en ?
          basesApi[apiRef].status = '?';
          //On rajoute une mine au compteur
          minesRestantes++;
          $(this)
            .css('background-image', 'url("img/bombquestion.gif")')
            //On remet le comportement du click normal
            .on('click', function() {
              activerCase(apiRef, basesApi, nbrX, nbrY);
            })
          //On met à jour le compteur de mines
          $('#minesR')
            .text('Mines restantes : ' + minesRestantes);
        //Si la case est ?
        } else if (basesApi[apiRef].status === '?') {
            //On la passe en normal
            //On a pas besoin de remettre l'écouteur d'événement étant donné que ça a été fait pour le ?
            basesApi[apiRef].status = 'normal';
            $(this)
              .css('background-image', 'url("img/blank.gif")');
        }
  });
}


$(document).ready(function() {
  $(document).bind("contextmenu", function(e) {
    return false;
  });
  //Bouton facile
	$('#easyBtn')
		.on('click', function() {
			//Détruit la partie précédente si elle existe
			$('table')
				.remove();
			//Crée un tableau facile
			creerTableau(9, 9, 10);
		});
	//Bouton Intermédiaire
	$('#mediumBtn')
		.on('click', function() {
			//Détruit la partie précédente si elle existe
			$('table')
				.remove();
			//Crée un tableau Intermédiaire
			creerTableau(16, 16, 40);
		});
	//Bouton Expert
	$('#expertBtn')
		.on('click', function() {
			//Détruit la partie précédente si elle existe
			$('table')
				.remove();
			//Crée un tableau Expert
			creerTableau(30, 16, 99);
		});
	$('#submit')
		.on('click', function(e){
			e.preventDefault();
			let row = +document.getElementById("row").value;
			let column = +document.getElementById("column").value;
			let mines = +document.getElementById("mines").value;
			if(row < 2 || row > 99 || isNaN(row)){
				$("#minesR")
					.text("Nombre de rangées invalide !");
			}
			else if(column < 2 || column > 99 || isNaN(column)){
				$("#minesR")
					.text("Nombre de colonnes invalide !");
			}
			else if(typeof mines !== "number" || isNaN(mines)){
				$("#minesR")
					.text("Nombre de mines invalide !");
			}
			else if(mines > row*column-1){
				$("#minesR")
					.text("Erreur : plus de mines que de cases");
			}
			else{
        //Détruit la partie précédente si elle existe
				$('table')
					.remove();
        //Crée un tableau personalisé
				creerTableau(column, row, mines);
			}
		});
});

