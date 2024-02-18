import React from 'react';
import {CFG} from './util/AllRooms';
import {useState,useEffect} from 'react';
import {PathDisplay} from './components/PathDisplay';
import {FromToModule} from './components/FromToModule';
import {AdultChildButtons,LinkState} from './components/AdultChildButtons';
import {findAllPaths, separatePathTree} from './util/FindAllPaths';
import {loadJson, saveJson} from './util/io';
import _ from 'lodash';

import './mapper.css';
import './common.css';

export interface MapperState {
	roomToDoors: Record<string, string[]>
	doorToDoor: Record<string, string>
	unlinkedDoors: Record<string, string>
	unlinkedWarps: Record<string, string>
	unlinkedOwls: Record<string, string>
	additionalBegin: Record<string, string>
}

function getUpdatedDoors(fromTo: [string, string][], oldState: MapperState)
{
	let newState: MapperState = _.cloneDeep(oldState);

	for (let pair of fromTo) {
		if (!pair[0] || !pair[1]) {
			console.log(`Both selections must be defined [${pair}]`);
			continue;
		}
		if (pair[0] === pair[1]) {
			console.log(`FROM and TO cannot be the same ${pair}`);
			continue;
		}

		delete newState.unlinkedDoors[pair[0]];
		delete newState.unlinkedDoors[pair[1]];

		let fromRoomId:string = pair[0].split("/")[0];
		let toRoomId:string = pair[1].split("/")[0];

		if (!newState.roomToDoors[fromRoomId]) {
			newState.roomToDoors[fromRoomId] = [];
		}
		newState.roomToDoors[fromRoomId].push(pair[0]);
		newState.doorToDoor[pair[0]] = pair[1];

		if (!CFG.one_way.includes(pair[0])) {
			if (!newState.roomToDoors[toRoomId]) {
				newState.roomToDoors[toRoomId] = [];
			}
			newState.roomToDoors[toRoomId].push(pair[1]);
			newState.doorToDoor[pair[1]] = pair[0];
		}
	}

	return newState;
}

function getUpdatedWarps(fromTo: [string, string][], oldState: MapperState)
{
	let newState: MapperState = _.cloneDeep(oldState);

	for (let pair of fromTo) {
		newState.additionalBegin[pair[1]] = pair[0];
		delete newState.unlinkedWarps[pair[0]];

		if (undefined === newState.roomToDoors[pair[1]]) {
			// Do this show that warp destination shows up in 'find' drop-down
			newState.roomToDoors[pair[1]] = [];
		}
	}

	return newState;
}

export function Mapper()
{
	const [mapperState, setMapperState] = useState<MapperState>(
	    getUpdatedDoors(CFG.auto_add,
	                    {
	                        unlinkedDoors: CFG.doors,
	                        unlinkedWarps: CFG.warps,
				unlinkedOwls: CFG.owls,
	                        roomToDoors: {},
	                        doorToDoor: {},
	                        additionalBegin: {}
	                    } as MapperState)
	);
	const [foundPaths, setFoundPaths] = useState<string[][]>([]);
	const [linkState, setLinkState] = useState<LinkState>("CHILD");
	const [fromTo, setFromTo] = useState<[string, string]|null>(null);

	const linkFunction = (pair: [string, string]) => {
		setMapperState(getUpdatedDoors([pair], mapperState));
	};

	const linkWarpFunction = (pair: [string, string]) => {
		setMapperState(getUpdatedWarps([pair], mapperState));
	};

	const linkOwlFunction = (pair: [string, string]) => {
		console.log("link Owl " + String(pair));

		let newState: MapperState = _.cloneDeep(mapperState);
		let owlDoorId: string = pair.join("/");
		let recvDoor: string = pair.reverse().join("/");

		delete newState.unlinkedOwls[pair[0]];
		
		if (!newState.roomToDoors[pair[0]]) {
			newState.roomToDoors[pair[0]] = [];
		}
		if (!newState.roomToDoors[pair[1]]) {
			newState.roomToDoors[pair[1]] = [];
		}
		newState.roomToDoors[pair[0]].push(owlDoorId);
		newState.doorToDoor[owlDoorId] = recvDoor;

		setMapperState(newState);
	}

	const findFunction = () => {
		if (!fromTo) {
			return;
		}

		let isChild: boolean = linkState === "CHILD";
		let allStarts: string[] = [fromTo[0]].concat(
			_.keys(mapperState.additionalBegin)
		         .filter((roomId: string) => {
				let warpMethod: string = mapperState.additionalBegin[roomId];

				// filter out child spawn if link is adult, and vice versa
				// TODO: Differentiate between a warp start and a regular start
				return !((isChild && CFG.adult_only.includes(warpMethod)) ||
				        (!isChild && CFG.child_only.includes(warpMethod)))
			})
		);
		let allPaths: string[][] = [];

		console.log(`Find from any ${allStarts} to ${fromTo[1]}`);

		for (let startId of allStarts) {
			if (!startId) {
				continue;
			}

			let foundPaths: string[][] = separatePathTree(findAllPaths(mapperState.roomToDoors,
			                                              mapperState.doorToDoor,
			                                              startId, fromTo[1], isChild));
			allPaths.push(...foundPaths);
		}

		console.log("Found paths: ");
		console.log(allPaths);
		setFoundPaths(allPaths);
	};

	useEffect(findFunction, [linkState, fromTo]);

	// Exclude rooms that shouldn't be known about, like "Kakariko Village Backyard"
	let selectableRoomMap: Record<string, string> =
		_.pick(CFG.areas, _.keys(_.omit(mapperState.roomToDoors, CFG.no_add)));

	console.log("Rendering: ");
	console.log(mapperState);

	return <div className="grid-container">
		<div className="grid-item title" id="grid-top">
			LOZR Path Finder
		</div>
		<div className="grid-item" id="grid-left">
			<FromToModule idToNameMapFrom={mapperState.unlinkedOwls}
				      idToNameMapTo={_.omit(CFG.areas, CFG.no_add)}
				      onClick={linkOwlFunction}
				      buttonTitle={"Link"}
				      title={"Owls"}
			/>
			<FromToModule idToNameMapFrom={mapperState.unlinkedWarps}
				      idToNameMapTo={_.omit(CFG.areas, CFG.no_add)}
				      onClick={linkWarpFunction}
				      buttonTitle={"Link"}
				      title={"Songs & Spawns"}
			/>
			<FromToModule idToNameMapFrom={mapperState.unlinkedDoors}
				      idToNameMapTo={mapperState.unlinkedDoors}
				      onClick={linkFunction}
				      buttonTitle={"Link"}
				      title={"Doors"}
			/>
			<AdultChildButtons className="title"
			                   initialState={linkState}
					   onChange={setLinkState}
			/>
			<FromToModule idToNameMapFrom={selectableRoomMap}
				      idToNameMapTo={selectableRoomMap}
				      onClick={setFromTo}
				      buttonTitle={"Find"}
				      title={"Rooms"}
			/>
			<button onClick={()=>saveJson(JSON.stringify(mapperState), 'lozr-cfg.json')}>
				<div className="title">{"SAVE"}</div>
			</button>
			<button onClick={()=>loadJson(setMapperState)}>
				<div className="title">{"LOAD"}</div>
			</button>
		</div>
		<div className="grid-item" id="grid-right">
			<PathDisplay paths={foundPaths} songWarps={mapperState.additionalBegin} />
		</div>
	</div>;
}
