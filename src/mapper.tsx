import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {CFG} from './AllRooms.js';
import {DoorDropDown} from './components/DoorDropDown.tsx';
import {RoomDropDown} from './components/RoomDropDown.tsx';
import {PathDisplay} from './components/PathDisplay.tsx';
import {MapperState,getUpdatedState} from './MapperState.ts';
import {findAllPaths, separatePathTree} from './util/FindAllPaths.ts';
import {loadJson, saveJson} from './util/io.ts';
import _ from 'lodash';

function validateFromTo(from: string|undefined, to: string|undefined): boolean
{
	if (undefined === from || undefined === to) {
		console.log(`Both selections must be defined [${from}, ${to}]`);
		return false;
	} else if (from === to) {
		console.log("FROM and TO cannot be the same");
		return false;
	}

	return true;
}

export function Mapper()
{
	const [mapperState, setMapperState] = useState<MapperState>({
		unlinkedRooms: CFG.doors,
		roomToDoors: {},
		doorToDoor: {}
	});
	const [foundPaths, setFoundPaths] = useState<string[][]>([]);

	const linkFromDoorId = useRef(undefined);
	const linkToDoorId = useRef(undefined);
	const findFromRoomId = useRef(undefined);
	const findToRoomId = useRef(undefined);
	
	const linkFunction = (fromId:string, toId:string) => {
		setMapperState(getUpdatedState([[fromId, toId]], mapperState));
	};

	const findFunction = (fromId:string, toId:string) => {
		if (validateFromTo(fromId, toId)) {
			setFoundPaths(separatePathTree(findAllPaths(mapperState.roomToDoors,
			                                            mapperState.doorToDoor,
			                                            fromId, toId)));
		}
	};

	useEffect(() => {
		setMapperState(getUpdatedState(CFG.auto_add, mapperState));
	}, []);

	return (<>
		<DoorDropDown name="From:"
		              doors={_.keys(mapperState.unlinkedRooms)}
		              onChange={(doorId:string)=>{linkFromDoorId.current=doorId}}
		/>
		<DoorDropDown name="To:"
		              doors={_.keys(mapperState.unlinkedRooms)}
		              onChange={(doorId:string)=>{linkToDoorId.current=doorId}}
		/>
		<button onClick={() => {linkFunction(linkFromDoorId.current,linkToDoorId.current)}}>LINK</button>
		<RoomDropDown name="From:"
		              rooms={_.keys(mapperState.roomToDoors)}
		              onChange={(roomId:string)=>{findFromRoomId.current=roomId}}
		/>
		<RoomDropDown name="To:"
		              rooms={_.keys(mapperState.roomToDoors)}
		              onChange={(roomId:string)=>{findToRoomId.current=roomId}}
		/>
		<button onClick={()=>{findFunction(findFromRoomId.current,findToRoomId.current)}}>FIND</button>
		<button onClick={()=>saveJson(JSON.stringify(mapperState), 'lozr-cfg.json')}>SAVE</button>
		<button onClick={()=>loadJson(setMapperState)}>LOAD</button>
		<PathDisplay paths={foundPaths} />
	</>);
}
