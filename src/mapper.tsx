import React from 'react';
import {useState,useRef} from 'react';
import {CFG} from './AllRooms.js';
import {PathDisplay} from './components/PathDisplay.tsx';
import {FromToModule} from './components/FromToModule.tsx';
import {AdultChildButtons,LinkState} from './components/AdultChildButtons.tsx';
import {findAllPaths, separatePathTree} from './util/FindAllPaths.ts';
import {loadJson, saveJson} from './util/io.ts';
import _ from 'lodash';

export interface MapperState {
	roomToDoors: Record<string, string[]>
	doorToDoor: Record<string, string>
	unlinkedDoors: Record<string, string>
	unlinkedDoors: Record<string, string>
	additionalBegin: Record<string, string>
}

function getUpdatedState(fromTo: string[2][], oldState: MapperState)
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
		if (!newState.roomToDoors[toRoomId]) {
			newState.roomToDoors[toRoomId] = [];
		}

		newState.roomToDoors[fromRoomId].push(pair[0]);
		newState.doorToDoor[pair[0]] = pair[1];

		if (!CFG.one_way.includes(pair[0])) {
			newState.roomToDoors[toRoomId].push(pair[1]);
			newState.doorToDoor[pair[1]] = pair[0];
		}
	}

	return newState;
}

export function Mapper()
{
	const [mapperState, setMapperState] = useState<MapperState>(
	    getUpdatedState(CFG.auto_add,
	                    {
	                        unlinkedDoors: CFG.doors,
	                        unlinkedWarps: CFG.warps,
	                        roomToDoors: {},
	                        doorToDoor: {},
	                        additionalBegin: {}
	                    })
	);
	const [foundPaths, setFoundPaths] = useState<string[][]>([]);
	const linkState = useRef<LinkState>("CHILD");

	const linkFunction = (fromId:string, toId:string) => {
		setMapperState(getUpdatedState([[fromId, toId]], mapperState));
	};

	const linkWarpFunction = (fromId: string, toId: string) => {
		let newState: MapperState = _.cloneDeep(mapperState);

		newState.additionalBegin[toId] = fromId;
		delete newState.unlinkedWarps[fromId];
		if (undefined === newState.roomToDoors[toId]) {
			newState.roomToDoors[toId] = [];
		}
		setMapperState(newState);
	};

	const findFunction = (fromId:string, toId:string) => {
		let isChild: boolean = linkState.current === "CHILD";
		let allStarts: string[] = [fromId].concat(
			_.keys(mapperState.additionalBegin)
		         .filter((roomId: string) => {
				let warpMethod: string = mapperState.additionalBegin[roomId];

				// filter out child spawn if link is adult, and vice versa
				return !((isChild && CFG.adult_only.includes(warpMethod)) ||
				        (!isChild && CFG.child_only.includes(warpMethod)))
			})
		);
		let allPaths: string[][] = [];

		console.log(`Find from any ${allStarts} to ${toId}`);

		for (let startId of allStarts) {
			if (!startId || !toId) {
				console.log(`ERROR: null [${startId}, ${toId}]`);
				continue;
			}

			let foundPaths: string[][] = separatePathTree(findAllPaths(mapperState.roomToDoors,
			                                              mapperState.doorToDoor,
			                                              startId, toId, isChild));
			allPaths.push(...foundPaths);
		}

		console.log("Found paths: ");
		console.log(allPaths);
		setFoundPaths(allPaths);
	};

	const getSelectableRooms = () => {
		// Exclude rooms that shouldn't be known about, like "Kakariko Village Backyard"
		return [..._.keys(mapperState.roomToDoors)
		            .filter(room => !CFG.no_add.includes(room))];
	};

	let selectableRoomMap: Record<string, string> = Object.fromEntries(
		getSelectableRooms().map(roomId => [roomId, CFG.areas[roomId]])
	);

	console.log("Rendering: ");
	console.log(mapperState);

	return <>
		<AdultChildButtons initialState={linkState.current}
		                   onChange={(state:string)=>{linkState.current=state}}
		/>
		<FromToModule idToNameMapFrom={mapperState.unlinkedWarps}
		              idToNameMapTo={CFG.areas}
		              onClick={linkWarpFunction}
		              buttonTitle={"LINK WARP"}
		/>
		<FromToModule idToNameMapFrom={mapperState.unlinkedDoors}
		              idToNameMapTo={mapperState.unlinkedDoors}
		              onClick={linkFunction}
		              buttonTitle={"LINK"}
		/>
		<FromToModule idToNameMapFrom={selectableRoomMap}
		              idToNameMapTo={selectableRoomMap}
		              onClick={findFunction}
		              buttonTitle={"FIND"}
		/>
		<button onClick={()=>saveJson(JSON.stringify(mapperState), 'lozr-cfg.json')}>SAVE</button>
		<button onClick={()=>loadJson(setMapperState)}>LOAD</button>
		<PathDisplay paths={foundPaths} songWarps={mapperState.additionalBegin} />
	</>;
}
