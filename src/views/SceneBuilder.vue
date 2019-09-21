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
                        :options="codeBlocks"
                        label="Code block"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="newCodeBlock" color="primary" style="width:100%">New</q-btn>
                </div>
                <div class="row" v-if="selectedInner!=0">
                    <div class="text-subtitle2 q-pa-sm col-12">Name</div>
                    <div class="col-12 q-pa-sm">
                        <q-input
                            filled
                            square
                            stack-label
                            v-model="selectedCodeBlock.name"
                            label="Name"
                            dense
                        />
                    </div>
                    <div class="text-subtitle2 q-pa-sm col-12">Parameters</div>
                    <div
                        class="col-6 q-pa-sm"
                        v-for="(parameter, index) in selectedCodeBlock.parameters"
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
                    <div class="text-subtitle2 q-pa-sm col-12">Code</div>
                    <div class="col-12 q-pa-sm">
                        <q-input
                            input-style="font-family:monospace;height:600px;"
                            filled
                            square
                            stack-label
                            type="textarea"
                            v-model="selectedCodeBlock.code"
                            dense
                        />
                    </div>
                    <div class="col-4 q-pa-sm" style="text-align:center">
                        <q-btn @click="parseCode" color="primary" style="width:100%">Execute</q-btn>
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
        <div class="col-8 q-pa-sm">
            <canvas id="canv" style="width:100%;height:600px"></canvas>
        </div>
    </div>
</template>

<style>
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import manifoldmanager from "./../3d/manifoldmanager";
import { saveAs } from "file-saver";
export default {
    name: "SceneBuilder",
    data() {
        return {
            codeBlocks: manifoldmanager.getAllCodeBlocks(),
            downloadString: "",
            selectedInner: 0,
            selectedCodeBlock: {},
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
        updateView: function() {
            manifoldmanager.rebuildLanguage();
        },
        parseCode() {
            this.saveCodeBlock();
            manifoldmanager.rebuildLanguage();
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            if (this.selectedCodeBlock.id >= 0) {
                this.downloadString = manifoldmanager.parseCode(
                    this.selectedCodeBlock.name +
                        "(" +
                        this.selectedCodeBlock.parameters
                            .map(x => x.value)
                            .join(",") +
                        ")"
                );
                loader.setMesh(this.downloadString);
            }
        },
        newCodeBlock() {
            var newCodeBlock = {
                name: "NewCodeBlock",
                id: this.codeBlocks.length + 1,
                code: ``,
                parameters: []
            };
            this.codeBlocks.push(newCodeBlock);
            this.selected = newCodeBlock.id;
        },
        newParameter() {
            this.newParamDialog = true;
            this.newParam = {
                id: "param" + this.selectedCodeBlock.parameters.length + 1,
                name: "Cool Param",
                value: 777
            };
        },
        saveParameter() {
            this.selectedCodeBlock.parameters.push(this.newParam);
            this.newParamDialog = false;
        },
        deleteParameter(index) {
            this.selectedCodeBlock.parameters.splice(index, 1);
        },
        saveCodeBlock() {
            var realCodeBlock = this.codeBlocks.find(
                x => x.id == this.selectedInner
            );
            var selectedCodeBlock = this.selectedCodeBlock;
            for (var param in selectedCodeBlock) {
                realCodeBlock[param] = JSON.parse(
                    JSON.stringify(selectedCodeBlock[param])
                );
            }
            localStorage.setItem("codeBlocks", JSON.stringify(this.codeBlocks));
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
                this.selectedCodeBlock = JSON.parse(
                    JSON.stringify(
                        this.codeBlocks.find(x => x.id == this.selectedInner)
                    )
                );
                this.updateView();
            }
        }
    },
    mounted() {
        this.updateView();
        this.parseCode();
    }
};
</script>
