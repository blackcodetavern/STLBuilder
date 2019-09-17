<template>
    <div class="row">
        <div class="col-4">
            <div class="row">
                <div class="col-8 q-pa-sm">
                    <q-select
                        option-value="id"
                        option-label="name"
                        emit-value
                        filled
                        map-options
                        v-model="selected"
                        :options="manifolds"
                        label="Manifold"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="updateView" color="primary" style="width:100%">New</q-btn>
                </div>
                <div class="text-subtitle2 q-pa-sm col-12">Name</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="selectedManifold.name"
                        label="Name"
                        dense
                    />
                </div>
                <div class="text-subtitle2 q-pa-sm col-12">Parameters</div>
                <div
                    class="col-6 q-pa-sm"
                    v-for="parameter in selectedManifold.parameters"
                    v-bind:key="parameter.id"
                >
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="parameter.value"
                        :label="parameter.name"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm col-12">Inner Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        style="font-family:monospace"
                        filled
                        square
                        stack-label
                        type="textarea"
                        v-model="selectedManifold.innerWallDefinition"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm">Outer Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        style="font-family:monospace"
                        filled
                        square
                        stack-label
                        v-model="selectedManifold.outerWallDefinition"
                        type="textarea"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="saveManifold" color="primary" style="width:100%">Save</q-btn>
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="updateView" color="primary" style="width:100%">Show</q-btn>
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center;padding-top:15px">
                    <a
                        style="width:100%"
                        :href="'data:application/octet-stream,' + encodeURIComponent(downloadString)"
                        download="generated.stl"
                    >Download</a>
                </div>
            </div>
        </div>
        <div class="col-8 q-pa-sm">
            <canvas id="canv" style="width:100%;height:600px"></canvas>
        </div>
    </div>
</template>

<style>
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import tunnlejs from "./../3d/tunnle";
export default {
    name: "PageHome",
    data() {
        return {
            manifolds: [
                {
                    name: "None",
                    id: 0,
                    outerWallDefinition: ``,
                    innerWallDefinition: ``,
                    parameters: [
                        { id: "hS", name: "# Horizontal steps", value: 10 },
                        { id: "vS", name: "# Vertical steps", value: 10 }
                    ],
                    otherHoles: []
                },
                {
                    name: "HerringboneGear",
                    id: 1,
                    outerWallDefinition: `x = (i%5<=2?8:10)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = (i%5<=2?8:10)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
                    innerWallDefinition: `x = 7*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = 7*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
                    parameters: [
                        { id: "hS", name: "# Horizontal steps", value: 100 },
                        { id: "vS", name: "# Vertical steps", value: 10 },
                        { id: "test", name: "Test", value: 10 }
                    ],
                    otherHoles: []
                }
            ],
            downloadString: "",
            parametersBasic: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 }
            ],
            selectedInner: 0
        };
    },
    methods: {
        getSurfaceWallFunction: function() {
            var f = Function(
                "wallDefinition",
                ...this.parameters.map(x => x.id),
                `

            var sin = Math.sin;
            var cos = Math.cos;
            var PI = Math.PI;
            return function(i, h) {
                function random() {
                    var x = Math.sin(i * hS + h) * 10000;
                    return x - Math.floor(x);
                }
                var x=0,y=0,z=0;eval(wallDefinition);return { x, y, z };};`
            );

            return f;
        },
        updateView: function() {
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            this.downloadString = tunnlejs.createMesh([
                tunnlejs.createMeshPart(
                    this.holes,
                    this.outerWallFunction,
                    this.innerWallFunction,
                    this.getParameter("hS").value,
                    this.getParameter("vS").value
                )
            ]);
            loader.setMesh(this.downloadString);
        },
        getParameter(id) {
            return this.selectedManifold.parameters.find(x => x.id == id);
        },
        saveManifold() {
            var newManifold = {
                name: this.name,
                id: 1,
                outerWallDefinition: `x = (i%5<=2?8:10)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = (i%5<=2?8:10)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
                innerWallDefinition: `x = 7*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = 7*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
                parameters: [
                    { id: "hS", value: 100 },
                    { id: "vS", value: 10 },
                    { id: "test", name: "Test", value: 10 }
                ],
                otherHoles: []
            };
        }
    },
    computed: {
        parameters() {
            return this.selectedManifold.parameters;
        },
        selected: {
            get() {
                return this.selectedInner;
            },
            set(selection) {
                this.selectedInner = selection;
                this.updateView();
            }
        },
        selectedManifold: {
            get() {
                return this.manifolds[this.selectedInner];
            }
        },
        innerWallFunction() {
            return this.getSurfaceWallFunction()(
                this.selectedManifold.innerWallDefinition,
                ...this.parameters.map(x => x.value)
            );
        },
        outerWallFunction() {
            return this.getSurfaceWallFunction()(
                this.selectedManifold.outerWallDefinition,
                ...this.parameters.map(x => x.value)
            );
        },
        holes() {
            return [
                {
                    top: this.getParameter("vS").value - 1,
                    left: 0,
                    bottom: 0,
                    right: this.getParameter("hS").value - 1
                }
            ];
        }
    },
    mounted() {
        this.updateView();
    }
};
</script>
