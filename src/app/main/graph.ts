/// <reference path="../../../typings/tsd.d.ts" />

module ArmViz {
    export class Graph {
        private graph: joint.dia.Graph;
        private paper: joint.dia.Paper;
        
        private template: ArmTemplate;
        private toolboxItems: ToolboxResource[];
        private resourceShapes: ResourceShape[] = new Array<ResourceShape>();
        private resourceShapeLinks: ResourceShapeLink[] = new Array<ResourceShapeLink>();
        
        resourceSelected: (resource:Resource, modal:boolean) => void;
        
        constructor(toolboxItems:ToolboxResource[]) {
            this.toolboxItems = toolboxItems;
            
            this.initJointJs();
            this.initializeClickPopup();
        }
        
        applyTemplate(template:ArmTemplate) {
            this.reset();
            
            this.template = template;
            
            this.createNodes();
            this.createLinks();
            this.autoSetShapePositions();
            this.displayNodesAndLinks();
            
            this.watchModel();
        }
        
        private watchModel() {
            let self = this;
            this.template.resources.subscribe<KnockoutArrayChange<Resource>[]>((changes) => {
                changes.forEach((change) => {
                        if (change.status === 'added') {
                            let shape = self.addResource(change.value);
                            self.addShape(shape);
                        } else if (change.status === 'deleted') {
                            //Remove from the array too?
                            self.removeResourceShape(change.value);
                        }
                    });
                }, null, "arrayChange");
        }
        
        private reset() {
            this.resourceShapes = new Array<ResourceShape>();
            this.resourceShapeLinks = new Array<ResourceShapeLink>();
            
            this.graph.clear();
        }
        
        private initJointJs() {
            this.graph = new joint.dia.Graph();
            this.paper = new joint.dia.Paper(<any>{ el: $('#paper'), gridSize: 1, model: this.graph, height: '100%', width: '100%' });
        }
        
        private createNodes() {
            ko.utils.arrayForEach(this.template.resources(), resource => {
                this.addResource(resource);
            });
        }
        
        private addResource(resource:Resource) {
            var toolboxItem: ToolboxResource = this.getToolboxItemForResource(resource);
            
            var shape = new ResourceShape(resource, toolboxItem);
            shape.position(60, 60);
            shape.resize(110, 80);
            
            this.resourceShapes.push(shape);
            
            return shape;
        }
        
        addInertShape(shape:Shape) {
            shape.position(60, 60);
            
            this.graph.addCell(shape);
        }
        
        private displayNodesAndLinks() {
            this.resourceShapes.forEach(shape => {
                this.addShape(shape); 
            });
            
            this.resourceShapeLinks.forEach(shapeLink => {
            this.addShapeLink(shapeLink); 
            });
            
            var bbox = (<any>this.paper).getContentBBox();
            (<any>this.paper).fitToContent(bbox.width, bbox.height + 400);
        }
        
        private createLinks() {
            var self = this;
            
            ko.utils.arrayForEach(this.template.resources(), resource => {
                var dependencies = self.template.getDependencies(resource);
                
                dependencies.forEach(dep => {
                    var sourceNode = self.getShapeForResource(resource);
                    var destNode = self.getShapeForResource(dep);
        
                    var l = new joint.dia.Link({
                        source: { id: sourceNode.id },
                        target: { id: destNode.id },
                        attrs: {
                            '.connection': { 'stroke-width': 3, stroke: '#34495E' },
                            '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
                        }
                    });
        
                    this.resourceShapeLinks.push(l);
                });
            });
        }
        
        private addShape(shape:ResourceShape) {
            this.graph.addCell(shape);
        }
        
        private addShapeLink(link:ResourceShapeLink) {
            this.graph.addCell(link);
        }
        
        private removeResourceShape(resource:Resource) {
            let shape = this.getShapeForResource(resource);
            shape.remove();
        }
        
        private getToolboxItemForResource(resource:Resource): ToolboxResource {
            var foundItem:ToolboxResource = null;
            
            this.toolboxItems.forEach(toolboxItem => {
            if(toolboxItem.resourceType === resource.type) {
                foundItem = toolboxItem;
            }
            });
            
            return foundItem;
        }
        
        private getShapeForResource(resource:Resource) {
            var retShape:ResourceShape;
            
            this.resourceShapes.forEach(shape => {
            if(shape.sourceResource === resource) {
                retShape = shape;
            } 
            });
            
            return retShape;
        }
        
        private initializeClickPopup() {
            var self = this;
            this.paper.on('cell:pointerdown', (evt, x, y) => {
                var shape:ResourceShape = evt.model;
                self.displayResource(shape.sourceResource, false);
            });
            
            this.paper.on('cell:pointerdblclick', (cellView:any, evt:any, x:any, y:any) => {
                var shape:ResourceShape = cellView.model;
                self.displayResource(shape.sourceResource, true);
            });
        }
        
        private displayResource(resource:Resource, modal:boolean) {
            if(this.resourceSelected) {
                this.resourceSelected(resource, modal);
            }
        }
        
        private autoSetShapePositions() {
            var self = this;
        //https://github.com/cpettitt/dagre/wiki#configuring-the-layout
    
            var g = new dagre.graphlib.Graph();
    
            // Set an object for the graph label
            g.setGraph({});
    
            // Default to assigning a new object as a label for each new edge.
            g.setDefaultEdgeLabel(() => { return {}; });
    
            this.resourceShapes.forEach(shape => {
            g.setNode(shape.id, { width: shape.attributes.size.width, height: shape.attributes.size.height });
            });
    
            this.resourceShapeLinks.forEach(shapeLink => {
                g.setEdge(shapeLink.attributes.source.id, shapeLink.attributes.target.id);
            });
    
            
            dagre.layout(g);
    
            g.nodes().forEach((node) => {
                var shape = _.findWhere(self.resourceShapes, { id: node });
    
                shape.attributes.position.x = g.node(node).x;
                shape.attributes.position.y = g.node(node).y + 50;
            });
        }
    }
}