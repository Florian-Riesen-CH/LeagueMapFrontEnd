
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @Output() requestGetData = new EventEmitter<{ summonerName: string, tagName: string, historicalNb: string }>();
  // Définir une propriété pour contrôler l'opacité du menu
  menuOpacity: number = 1; // Opacité initiale à 100%
  
  summonerName: string = ''; // Pour stocker le nom du joueur
  tagName: string = 'EUW'; // Pour stocker le nom du joueur
  historicalNb: string = '5'; // Pour stocker le nombre de jeux sélectionné
  hasErrorSummoner: boolean = false;

  triggerError(): void {
    this.hasErrorSummoner = true;

    // Optionnel : réinitialiser après l'animation
    //setTimeout(() => this.hasErrorSummoner = false, 500); // Assurez-vous que ceci correspond à la durée de l'animation
  }

  // La fonction appelée lorsque l'utilisateur clique sur le bouton "Générer"
  makeMenuTransparent(): void {
    this.menuOpacity = 0.3; // Change l'opacité à 50%
  }
  restoreOpacity(): void {
    this.menuOpacity = 1; // Restaure l'opacité complète
  }
  triggerGetData(): void {
    this.hasErrorSummoner = false

    this.requestGetData.emit({ summonerName: this.summonerName, tagName: this.tagName , historicalNb: this.historicalNb});
  }
}
