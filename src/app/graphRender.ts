

import { ElementRef } from "@angular/core";
import { SIGNAL } from "@angular/core/primitives/signals";
import Graph from "graphology";
import Sigma from "sigma";
import { EdgeArrowProgram } from "sigma/rendering";
import { NodeImageProgram } from "@sigma/node-image";
import EdgeCurveProgram from "@sigma/edge-curve";
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Coordinates, EdgeDisplayData, NodeDisplayData } from "sigma/types";

interface State {
    hoveredNode?: string;
    searchQuery: string;

    // State derived from query:
    selectedNode?: string;
    suggestions?: Set<string>;

    // State derived from hovered node:
    hoveredNeighbors?: Set<string>;
  }
export default class graphRender {
    
    private graph: Graph;
    private sigma: Sigma;
    private element :ElementRef;
    private suggestionList :ElementRef;
    private state : State;
  
    constructor(element: ElementRef,suggestionList: ElementRef) {
      this.graph = new Graph();
      this.element = element;
      this.suggestionList = suggestionList;
      this.sigma = new Sigma(this.graph, this.element.nativeElement)
      this.state = { searchQuery: "" };
    }

    initializeEventHandlers() {
      this.sigma.on("enterNode", ({ node }) => {
        this.setHoveredNode(node);
      });
      this.sigma.on("leaveNode", () => {
        this.setHoveredNode(undefined);
      });
    }

    getDatas(data:any){
        for (const mainChar in data.dataSetLines) {
            if (!this.graph.hasNode(mainChar)){
              this.graph.addNode(mainChar, {x:Math.random(),y:Math.random(),size: this.getTotalGames(mainChar, data ), label: mainChar,image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'+mainChar+'_0.jpg' });
            }
          }
          for (const mainChar in data.dataSetLines) {
            // Parcourir chaque personnage associé et ses stats
            const associatedChars = data.dataSetLines[mainChar];
            for (const char in associatedChars) {
              const stats = associatedChars[char];
              if (!this.graph.hasNode(char)){
                this.graph.addNode(char, {x:Math.random(),y:Math.random(),size: 20, label: char,image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'+char+'_0.jpg' });
              }
              var size = (stats.cptWin+stats.cptLose)*6
              this.graph.addEdge(mainChar, char, { label: `${stats.cptWin}/${stats.cptLose}`, forceLabel: true, size: size, type: 'arrow', color:this.winrateToColor(stats.winrate) });
            }
          }
    }

    setSugestionList(){
      var suggestions : string[] = [];
      this.graph
      .nodes()
      .map((node) => suggestions.push(node));
      return suggestions;
    }
   
    getTotalGames(championName:string, data:any) {
        let totalGames = 0;
        const championStats = data.dataSetLines[championName];

        if (!championStats) {
            return 0; // Retourner 0 si le champion n'est pas trouvé
        }

        for (const opponent in championStats) {
            const stats = championStats[opponent];
            totalGames += stats.cptWin + stats.cptLose;
        }
        totalGames = totalGames / 5;
        totalGames = 30 + (totalGames * 1.5)
        return totalGames;
    }
    winrateToColor(winrate: number) {
        // Assurez-vous que le taux de victoire est un nombre entre 0 et 100
        winrate = Math.max(0, Math.min(100, winrate));
      
        // Utiliser une valeur maximale inférieure à 255 pour obtenir des couleurs plus foncées
        let maxValue = 200; // Ajustez cette valeur pour contrôler la 'foncéité'
        
        // Calculer la valeur verte (augmente avec le taux de victoire)
        // Assurez-vous que même à 100%, vert ne dépasse pas la valeur maximale choisie
        let green = Math.round((winrate / 100) * maxValue);
        
        // Calculer la valeur rouge (diminue avec le taux de victoire)
        // Assurez-vous que même à 0%, rouge ne dépasse pas la valeur maximale choisie
        let red = maxValue - Math.round((winrate / 100) * maxValue);
      
        // Retourner la couleur au format RGB
        return `rgb(${red}, ${green}, 0)`;
    }

    processGraph(){
      this.sigma.kill()
        this.sigma = new Sigma(this.graph,this.element.nativeElement, {
            allowInvalidContainer: true,
            defaultEdgeType: "straight",
            renderEdgeLabels: true,
            edgeProgramClasses: {
              straight: EdgeArrowProgram,
              curved: EdgeCurveProgram,
            },
            defaultNodeType: "image",
            nodeProgramClasses: {
              image: NodeImageProgram,
            },
          });
          forceAtlas2.assign(this.graph,50); 

        
    }
    EdgesReducer(){
      return this.sigma.setSetting("edgeReducer", (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };
    
        if (this.state.hoveredNode && !this.graph.hasExtremity(edge, this.state.hoveredNode)) {
          res.hidden = true;
          
        }
    
        if (
            this.state.suggestions &&
          (!this.state.suggestions.has(this.graph.source(edge)) || !this.state.suggestions.has(this.graph.target(edge)))
        ) {
          res.hidden = true;
        }
    
        return res;
      });
    }
    NodesReducer(){
      return this.sigma.setSetting("nodeReducer", (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };
    
        if (this.state.hoveredNeighbors && !this.state.hoveredNeighbors.has(node) && this.state.hoveredNode !== node) {
          res.label = ""
          res.color = "#f6f6f6";
          res.hidden = true;
        }
    
        if (this.state.selectedNode === node) {
          res.highlighted = true;
        } else if (this.state.suggestions) {
          if (this.state.suggestions.has(node)) {
            res.forceLabel = true;
          } else {
            res.label = "";
            res.color = "#f6f6f6";
            res.hidden = true;
          }
        }
    
        return res;
      });

      
    }

    setSearchQuery(query: string) {
      this.state.searchQuery = query;
      console.log("query:" + query);
      var suggestions = this.graph
          .nodes()
          .map((n) => ({ id: n, label: this.graph.getNodeAttribute(n, "label") as string }))
      if (query) {
        const lcQuery = query.toLowerCase();
        suggestions = suggestions
          .filter(({ label }) => label.toLowerCase().includes(lcQuery));
  
        // If we have a single perfect match, them we remove the suggestions, and
        // we consider the user has selected a node through the datalist
        // autocomplete:
        if (suggestions.length === 1 && suggestions[0].label === query) {
          this.state.selectedNode = suggestions[0].id;
          this.state.suggestions = undefined;
          this.setHoveredNode(this.state.selectedNode) 
  
          // Move the camera to center it on the selected node:
          const nodePosition = this.sigma.getNodeDisplayData(this.state.selectedNode) as Coordinates;
          this.sigma.getCamera().animate(nodePosition, {
            duration: 500,
          });
        }
        // Else, we display the suggestions list:
        else {
          this.state.selectedNode = undefined;
          this.state.suggestions = new Set(suggestions.map(({ id }) => id));
        }
      }else{
        this.state.selectedNode = undefined;
        this.state.suggestions = new Set(suggestions.map(({ id }) => id));
        this.setHoveredNode(undefined) 
        
      }
      
    }
    setHoveredNode(node?: string) {
        if (node) {
            this.state.hoveredNode = node;
            this.state.hoveredNeighbors = new Set(this.graph.neighbors(node));
        }
    
        // Compute the partial that we need to re-render to optimize the refresh
        const nodes = this.graph.filterNodes((n) => n !== this.state.hoveredNode && !this.state.hoveredNeighbors?.has(n));
        const nodesIndex = new Set(nodes);
        const edges = this.graph.edges();
    
        if (!node) {
            this.state.hoveredNode = undefined;
            this.state.hoveredNeighbors = undefined;
        }
    
        this.sigma = this.EdgesReducer()
        this.sigma = this.NodesReducer()
        // Refresh rendering
        this.sigma.refresh({
          partialGraph: {
            nodes,
            edges,
          },
          // We don't touch the graph data so we can skip its reindexation
          skipIndexation: true,
        });
      }
  }
