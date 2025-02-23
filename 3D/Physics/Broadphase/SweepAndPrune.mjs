import Vector3 from "../Math3D/Vector3.mjs";
import Hitbox3 from "../Broadphase/Hitbox3.mjs";

var SweepAndPrune = class {

    constructor(options) {
        this.world = options?.world ?? null;
        this.ids = {};
    }

 
    remove(id) {
        delete this.ids[id];
    }

    addHitbox(hitbox, id) {
        if (this.ids[id]) {
            if (this.ids[id].hitbox.equals(hitbox)) {
                return;
            }
        }
        else{
            this.ids[id] = {};
        }

        this.ids[id].hitbox = hitbox.copy();
    }

    findAllPairs(){
        
    }

    toJSON() {
        
    }

    static fromJSON(json, world) {
        
    }
};


export default SweepAndPrune;