// BABA IS Y'ALL SOLVER - BLANK TEMPLATE
// Version 1.0
// Code by Milk 


//get imports (NODEJS)
// Outline:
// initAgent() -> iterSolve(){ queue.shift() stateSet.push() queue.push() queue.sort() } ->
// MCTS_run() { root.mctsSearch() root.bestAction() } -> action

// todo: implement a timer to stop the search after a certain amount of time

var simjs = require('../js/simulation');					//access the game states and simulation

const MCTS_ITERATIONS = 5;
const ROLLOUT_DEPTH = 10;
const HUGE_NEGATIVE = -10000000.0;
const HUGE_POSITIVE = 10000000.0;
const EPISILON = 1e-6;
const MAXIMUM = 1e9;
const C = Math.sqrt(2);

let possActions = ["space", "right", "up", "left", "down"];

let stateSet = [];
let curIteration = 0;
let totalIters = 0;
let totalSteps = 0;
// let queue = [];
// let mctsAgent = null;
let currentNode = null;
let rootMap = null;



function newState(kekeState, map) {
    simjs.clearLevel(kekeState);
    kekeState.orig_map = map;
    [kekeState.back_map, kekeState.obj_map] = simjs.splitMap(kekeState.orig_map);
    simjs.assignMapObjs(kekeState);
    simjs.interpretRules(kekeState);
}


function initAgent(init_state) {
    // mctsAgent = new SingleMCTSPlayer(possActions);
    curIteration = 0;
    stateSet = [];
    currentNode = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
    // queue = [[0, master_node]];
    stateSet.push(currentNode.mapRep);
    rootMap = init_state['orig_map'];
}

// NEXT ITERATION STEP FOR SOLVING
function iterSolve(init_state) {
    // // PERFORM ITERATIVE CALCULATIONS HERE //
    // // if (queue.length < 1)
    // //     return [];
    //
    // //pop the next node off the queue and get its children
    // let curnode = queue.shift()[1];
    // children = getChildren(init_state['orig_map'], curnode);
    //
    // //check if golden child was found
    // for (let c = 0; c < children.length; c++) {
    //     stateSet.push(children[c][1].mapRep);
    //     //console.log(children[c].mapRep);
    //     if (children[c][1].win) {
    //         //console.log(children[c][1].actionSet);
    //         return children[c][1].actionSet;
    //     }
    // }
    //
    // //otherwise add to the list and sort it for priority
    // queue.push.apply(queue, children);
    // queue.sort();
    // curIteration++;

    // Do the search within the available time.
    // todo: add time constraints
    totalIters += mctsSearch(currentNode);
    totalSteps++;

    // Determine the best action to take and return it.
    currentNode = bestAction(currentNode);
    // let currentNode = mostVisitedAction();

    return currentNode.actionHistory;

    // stateSet.push(child.mapRep);
    // if (child.win) {
    //     return child.actionHistory;
    // }
    // currentNode = child;
    //
    // //return a sequence of actions or empty list
    // return [];
}

// class SingleMCTSPlayer {
//     constructor(possActions) {
//         this.actions = possActions;
//         this.num_actions = possActions.length;
//     }

// function init(gameState) {
//     this.m_root = new SingleTreeNode(simjs.map2Str(initState.orig_map), [], null, false, false);
// }

function applyActions(newActions) {
    //move the along the action space
    let state = {};
    newState(state, rootMap);
    let didwin = false;
    for (let a = 0; a < newActions.length; a++) {
        let res = simjs.nextMove(newActions[a], state);
        state = res['next_state'];
        didwin = res['won'];

        //everyone died
        if (state['players'].length === 0) {
            didwin = false;
            break;
        }
    }
    return {state, didwin};
}

// RETURNS AN ASCII REPRESENTATION OF THE MAP STATE AFTER AN ACTION IS TAKEN
function getNextState(dir, parent) {


    //get the action space from the parent + new action
    let newActions = [];
    newActions.push.apply(newActions, parent.actionSet);
    newActions.push(dir);

    //console.log("before KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map))
    let {state, didwin} = applyActions(newActions);

    //console.log(d);
    //console.log("after KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map));

    return new SingleTreeNode(simjs.doubleMap2Str(state.obj_map, state.back_map), newActions, parent, didwin, (state['players'].length === 0))
}

// RETURNS AN ASCII REPRESENTATION OF THE MAP STATE AFTER AN ACTION IS TAKEN
function getNodeStateScore(node) {
    let state = {};
    newState(state, rootMap)

    //console.log("before KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map))

    //move the along the action space
    let actions = node.actionHistory;
    let didwin = false;
    for (let a = 0; a < actions.length; a++) {
        let res = simjs.nextMove(actions[a], state);
        state = res['next_state'];
        didwin = res['won'];

        //everyone died
        if (state['players'].length === 0) {
            didwin = false;
            break;
        }

    }

    let score = getHeuristicScore(state);
    //console.log(d);
    //console.log("after KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map));


    return [score, new node(simjs.doubleMap2Str(state.obj_map, state.back_map), actions, parent, didwin, (state['players'].length === 0))]
}

//return distance from nearest goal for priority queue purposes
function getHeuristicScore(state) {
    let win_d = heuristic2(state['players'], state['winnables']);
    let word_d = heuristic2(state['players'], state['words']);
    let push_d = heuristic2(state['players'], state['pushables']);
    // return (win_d + word_d + push_d) / 3;
    return 3 / (win_d + word_d + push_d);
}

// FIND AVERAGE DISTANCE OF GROUP THAT IS CLOSEST TO ANOTHER OBJECT IN A DIFFERENT GROUP
function heuristic2(g1, g2) {
    let allD = [];
    for (let g = 0; g < g1.length; g++) {
        for (let h = 0; h < g2.length; h++) {
            let d = dist(g1[g], g2[h]);
            allD.push(d);
        }
    }

    let avg = 0;
    for (let i = 0; i < allD.length; i++) {
        avg += allD[i];
    }
    return avg / allD.length;
}

// BASIC EUCLIDEAN DISTANCE FUNCTION FROM OBJECT A TO OBJECT B
function dist(a, b) {
    return (Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
}

// function run() {
//     this.m_root.mctsSearch();
//
//     let action = this.m_root.bestAction();
//     // let action = this.m_root.mostVisitedAction();
//
//     return action;
// }

// }

// class SingleTreeNode {
//     constructor(m, a, p, w, d) {
//         this.mapRep = m;
//         this.actionHistory = a;
//         this.parent = p;
//         this.won = w;
//         this.died = d;
//         this.toValue = 0;
//         this.m_depth = 0;
//
//         if (parent != null)
//             this.m_depth = parent.m_depth + 1;
//         else
//             this.m_depth = 0;
//     }
//
//     // TODO: timer & avgTimeTaken
//     mctsSearch() {
//         let numIters = 0;
//
//     }
//
// }

function SingleTreeNode(m, a, p, w, d) {
    this.mapRep = m;
    this.actionHistory = a;
    this.parent = p;
    this.won = w;
    this.died = d;
    this.nVisits = 0;
    this.toValue = 0;
    this.m_depth = 0;
    this.children = [null, null, null, null];

    if (this.parent != null)
        this.m_depth = parent.m_depth + 1;
    else
        this.m_depth = 0;
}

// TODO: timer & avgTimeTaken
function mctsSearch(root) {
    let numIters = 0;
    while (numIters < MCTS_ITERATIONS) {
        let start = new Date().getTime();

        // selection & node expansion
        let selected = treePolicy(root);
        // simulation
        let delta = rollOut(root, selected);
        // backpropagation
        backUp(selected, delta);

        let end = new Date().getTime();
        console.log('[' + numIters + 'th iteration in mstsSearch] Time taken: ', (end - start) / 1000 + 's');
        numIters++;
    }
    return numIters;
}


function treePolicy(node) {
    let cur = node;
    while (!cur.win && cur.m_depth < ROLLOUT_DEPTH) {
        // notFullyExpanded
        let action = isFullyExpanded(cur)
        if (action !== -1) {
            // expand
            let n_kk_p = {};
            newState(n_kk_p, rootMap);
            // let n_kk_p = deepCopyObject(rootstate);
            cur.children[action] = getNextState(possActions[action], n_kk_p, cur);
            return cur.children[action];
        } else {
            let next = uct(cur);
            cur = next;
        }
    }
    return cur;
}

function isFullyExpanded(node) {
    let action = -1;
    for (let i = 0; i < possActions.length; i++) {
        if (node.children[i] == null) {
            if (action === -1 || Math.random() > 0.5) {
                action = i;
            }
        }
    }
    return action;
}

function normalise(val) {
    let min = -MAXIMUM;
    let max = MAXIMUM;
    return (val - min) / (max - min);
}

function noise(input, random) {
    if (input !== EPISILON) {
        return (input + EPISILON) * (1 + EPISILON * (random - 0.5));
    } else {
        return (input + EPISILON) * (1 + EPISILON * (random - 0.5));
    }
}

// UCT（Upper Confidence Bound Apply to Tree)
function uct(node) {
    let selected = null;
    let bestValue = -MAXIMUM;
    for (let child in node.children) {
        let val = child.toValue;
        let childValue = val / (child.nVisits + EPISILON);
        childValue = normalise(childValue);

        let uctValue = childValue + C * Math.sqrt(Math.log(node.nVisits + 1) / (child.nVisits + EPISILON));
        // small sampleRandom numbers: break ties in unexpanded nodes
        uctValue = noise(uctValue, Math.random());

        if (uctValue > bestValue) {
            selected = child;
            bestValue = uctValue;
        }
    }

    if (selected == null) {
        console.log("Warning! returning null: " + bestValue + " : " + this.children);
    }
    return selected;
}

// todo: e-greedy
function eGreedy(node) {
}


function rollOut(selected) {
    let depth = selected.depth;
    let isGameOver = selected.won || selected.died;
    let {rollerState, didwin} = applyActions(selected.actionHistory);
    let died = false;
    while (depth < ROLLOUT_DEPTH && !isGameOver) {
        // random move
        let action = possActions[Math.floor(Math.random() * possActions.length)];
        let res = simjs.nextMove(action, rollerState);
        rollerState = res['next_state'];
        didwin = res['won'];
        died = rollerState['players'].length === 0
        isGameOver = didwin || died;
        depth++;
    }

    return value(rollerState, didwin, died);
}


function value(rollerState, didwin, died) {
    let delta = getHeuristicScore(rollerState);
    if (didwin) {
        delta += HUGE_POSITIVE;
    }
    if (died) {
        delta += HUGE_NEGATIVE;
    }

    delta = delta > MAXIMUM ? MAXIMUM : delta;
    return delta < -MAXIMUM ? -MAXIMUM : delta;
}

// backpropagation along the tree
function backUp(node, result){
    let cur = node;
    while (cur != null){
        cur.nVisits++;
        cur.toValue += result;
        // todo: cur.bounds[]
        cur = cur.parent;
    }
}

function bestAction(node){
    let selected = null;
    let bestValue = -MAXIMUM;
    let children = node.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i] !== null){
            let childValue = children[i].toValue / (children[i].nVisits + EPISILON);
            childValue = noise(childValue, Math.random());
            if (childValue > bestValue){
                selected = children[i];
                bestValue = childValue;
            }
        }
    }

    if (selected == null){
        console.log("Unexpected selection! No valid child found!");
    }

    return selected;
}

function mostVisitedAction(node){
    let selected = null;
    let bestValue = -MAXIMUM;
    let allEqual = true;
    let first = -1;

    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i] !== null){
            if (first === -1){
                first = children[i].nVisits;
            }else if (first !== children[i].nVisits){
                allEqual = false;
            }

            let childValue = children[i].nVisits;
            childValue = noise(childValue, Math.random());
            if (childValue > bestValue){
                selected = children[i];
                bestValue = childValue;
            }
        }

    }

    if (selected == null){
        console.log("Unexpected selection! No valid child found!");
    }else if (allEqual){
        // If all are equal, we opt to choose for the one with the best Q.
        selected = bestAction(node);
    }

    return selected;
}

// GETS THE CHILD STATES OF A NODE
function getChildren(rootMap, parent) {
    let children = [];

    for (let a = 0; a < possActions.length; a++) {
        //remake state everytime
        let n_kk_p = {};
        newState(n_kk_p, rootMap)

        //let n_kk_p = deepCopyObject(rootstate);
        let childNode = getNextState(possActions[a], n_kk_p, parent);

        //add if not already in the queue
        if (stateSet.indexOf(childNode[1].mapRep) === -1 && !childNode[1].died) {

            children.push(childNode);
        }
        //console.log(outMap);
    }
    return children;
}

// VISIBLE FUNCTION FOR OTHER JS FILES (NODEJS)
module.exports = {
    step: function (init_state) {
        return iterSolve(init_state);
    },		// iterative step function (returns solution as list of steps from poss_actions or empty list)
    init: function (init_state) {
        return initAgent(init_state);
    },							// initializing function here
    best_sol: function () {
        return [];
    }				//returns closest solution in case of timeout
}

