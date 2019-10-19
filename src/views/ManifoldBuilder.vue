<template>
    <q-page>
        <div style="position:absolute;left:0px;top:0px;">
            <canvas id="canv"></canvas>
        </div>
        <div
            style="position:absolute;top:0;left:0;width:500px;overflow:auto;background-color:rgba(0,0,0,.05);height:calc(100vh - 50px) !important"
        >
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
                    <q-btn @click="newManifold" color="primary" style="width:100%">New</q-btn>
                </div>
                <div class="row" v-if="selectedInner!=0">
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
                        v-for="(parameter, index) in selectedManifold.parameters"
                        v-bind:key="parameter.id"
                    >
                        <q-input
                            filled
                            square
                            stack-label
                            v-model="parameter.value"
                            :label="parameter.name+'('+parameter.id+')'"
                            dense
                        >
                            <template v-slot:append>
                                <q-btn
                                    v-if="parameter.id!='vS' && parameter.id!='hS'"
                                    round
                                    dense
                                    flat
                                    icon="delete"
                                    @click="deleteParameter(index)"
                                />
                            </template>
                        </q-input>
                    </div>
                    <div class="col-12 q-pa-sm">
                        <q-btn @click="newParameter" color="primary">New Parameter</q-btn>
                    </div>
                    <div class="text-subtitle2 q-pa-sm col-12">Inner Wall</div>
                    <div class="col-12 q-pa-sm">
                        <q-input
                            style="font-family:monospace;"
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
                        <q-btn @click="updateView" color="primary" style="width:100%">Update</q-btn>
                    </div>
                    <div class="col-4 q-pa-sm" style="text-align:center;">
                        <q-btn @click="download" color="primary" style="width:100%">Download</q-btn>
                    </div>
                </div>
            </div>
            <q-dialog v-model="newParamDialog" persistent>
                <q-card style="min-width: 400px">
                    <q-card-section>
                        <div class="text-h6">Your address</div>
                    </q-card-section>

                    <q-card-section>
                        <q-input label="Parameter name" v-model="newParam.id" autofocus />
                        <q-input label="Parameter description" v-model="newParam.name" />
                        <q-input label="Parameter value" v-model="newParam.value" />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Cancel" v-close-popup />
                        <q-btn flat label="Add" v-close-popup @click="saveParameter" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </q-page>
</template>

<style>
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import manifoldmanager from "./../3d/manifoldmanager";
import { saveAs } from "file-saver";
export default {
    name: "ManifoldBuilder",
    data() {
        return {
            manifolds: manifoldmanager.getAllManifolds(),
            downloadString: "",
            parametersBasic: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 }
            ],
            selectedInner: 0,
            selectedManifold: {},
            newParamDialog: false,
            newParam: {
                id: "",
                name: "",
                value: 777
            }
        };
    },
    methods: {
        download() {
            var filename = "Generated.stl";

            var blob = new Blob([this.downloadString], {
                type: "text/plain;charset=utf-8"
            });

            saveAs(blob, filename);
        },
        newParameter() {
            this.newParamDialog = true;
            this.newParam = {
                id: "param" + this.selectedManifold.parameters.length + 1,
                name: "Cool Param",
                value: 777
            };
        },
        saveParameter() {
            this.selectedManifold.parameters.push(this.newParam);
            this.newParamDialog = false;
        },
        deleteParameter(index) {
            this.selectedManifold.parameters.splice(index, 1);
        },
        newManifold() {
            var newManifold = {
                name: "NewManifold",
                id: this.manifolds.length + 1,
                outerWallDefinition: ``,
                innerWallDefinition: ``,
                parameters: [
                    { id: "hS", name: "# Horizontal steps", value: 10 },
                    { id: "vS", name: "# Vertical steps", value: 10 }
                ]
            };
            this.manifolds.push(newManifold);
            this.selected = newManifold.id;
        },
        updateView: function() {
            this.saveManifold();
            setGlobalPosition(0, 0, 0);
            setGlobalRotation(0, 0, 0);
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            this.downloadString = manifoldmanager.createManifold([
                manifoldmanager.createManifoldPart(this.selectedInner)
            ]);
            loader.setMesh(this.downloadString);
        },
        saveManifold() {
            var realManifold = this.manifolds.find(
                x => x.id == this.selectedInner
            );
            var selectedManifold = this.selectedManifold;
            for (var param in selectedManifold) {
                realManifold[param] = JSON.parse(
                    JSON.stringify(selectedManifold[param])
                );
            }
            localStorage.setItem("manifolds", JSON.stringify(this.manifolds));
            manifoldmanager.rebuildLanguage();
        }
    },
    computed: {
        selected: {
            get() {
                return this.selectedInner;
            },
            set(selection) {
                this.selectedInner = selection;
                this.selectedManifold = JSON.parse(
                    JSON.stringify(
                        this.manifolds.find(x => x.id == this.selectedInner)
                    )
                );
                this.updateView();
            }
        }
    },
    mounted() {
        this.updateView();
    }
};
</script>
