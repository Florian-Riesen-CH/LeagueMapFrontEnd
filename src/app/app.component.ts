import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DataService } from './data.service';
import Graph from "graphology";
import Sigma from "sigma";
import { EdgeArrowProgram } from "sigma/rendering";
import { NodeImageProgram } from "@sigma/node-image";
import EdgeCurveProgram from "@sigma/edge-curve"
import { Coordinates, EdgeDisplayData, NodeDisplayData } from "sigma/types";
import forceAtlas2 from 'graphology-layout-forceatlas2';
import {random} from 'graphology-layout';
import {circular} from 'graphology-layout';
import forceLayout from 'graphology-layout-force';
import ForceSupervisor from 'graphology-layout-force/worker';
import { MenuComponent } from './menu/menu.component';
import graphRender from './graphRender'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'home'
  searchText = ""
  size = 0
  data: any;
  public innerWidth: any;
  public innerHeight: any;
  graphRender: graphRender;
  @ViewChild('container') myElement: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('suggestions') searchSuggestions!: ElementRef<HTMLDataListElement>;
  @ViewChild('menuRef') menuComponent: MenuComponent| undefined;

  suggestionList: string[] = [];

  constructor(private dataService: DataService) {
  }

  handleInputChange(value: string): void {
    console.log("Valeur reçue du composant enfant :", value);
    this.graphRender.setSearchQuery(value);
    // Traiter la valeur reçue comme nécessaire
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  getData(eventData: { summonerName: string, tagName:string, historicalNb: string }){
    console.log('Request back-end')

    this.dataService.getData(eventData.summonerName, eventData.tagName, eventData.historicalNb).subscribe(response => {
      this.data = response;
      console.log(this.searchSuggestions)
      this.graphRender = new graphRender(this.myElement, this.searchSuggestions);
      this.graphRender.getDatas(response);
      this.graphRender.processGraph();
      this.graphRender.initializeEventHandlers();
      this.suggestionList = this.graphRender.setSugestionList();

      
    },
    error => {
      // Gestion de l'erreur ici
      this.menuComponent?.triggerError();
      console.error('Error occurred:', error);
      // Vous pouvez, par exemple, afficher un message d'erreur à l'utilisateur en utilisant un service de notification
      // ou en définissant une variable dans votre composant pour afficher l'erreur dans le template
    });
  }
  ngOnInit(){
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  ngAfterViewInit() {
  }
}