import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {CFG} from './AllRooms.js';
import {DoorDropDown} from './components/DoorDropDown.tsx';
import {RoomDropDown} from './components/RoomDropDown.tsx';
import {PathDisplay} from './components/PathDisplay.tsx';
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
	const [roomToDoors, setRoomsToDoors] = useState<Record<string, string[]>>({});
	const [doorToDoor, setDoorToDoor] = useState<Record<string, string>>({});
	const [unlinkedRooms, setUnlinkedRooms] = useState<Record<string, string>>({});
	const [foundPaths, setFoundPaths] = useState<string[][]>([]);

	const linkFromDoorId = useRef(undefined);
	const linkToDoorId = useRef(undefined);
	const findFromRoomId = useRef(undefined);
	const findToRoomId = useRef(undefined);
	
	const loadState = (): void => {
		loadJson((data: any): void => {
			setRoomsToDoors(data.roomToDoors);
			setDoorToDoor(data.doorToDoor);
			setUnlinkedRooms(data.unlinkedRooms);
		});
	};

	const saveState = (): void => {
		saveJson(JSON.stringify({
			roomToDoors: roomToDoors,
			doorToDoor: doorToDoor,
			unlinkedRooms: unlinkedRooms
		}), 'lozr-cfg.json');
	};

	const linkFunction = (fromId:string, toId:string) => {
		if (!validateFromTo(fromId, toId)) {
			return;
		}

		let newUnlinks:Record<string, string> = _.cloneDeep(unlinkedRooms);
		let newRoomToDoors:Record<string, string[]> = _.cloneDeep(roomToDoors);
		let newDoorToDoor:Record<string, string> = _.cloneDeep(doorToDoor);

		delete newUnlinks[fromId];
		delete newUnlinks[toId];

		let fromRoomId:string = fromId.split("/")[0];
		let toRoomId:string = toId.split("/")[0];

		if (!newRoomToDoors[fromRoomId]) {
			newRoomToDoors[fromRoomId] = [];
		}
		if (!newRoomToDoors[toRoomId]) {
			newRoomToDoors[toRoomId] = [];
		}

		console.log(`Removing ${fromId} and ${toId} from links`);
		console.log(`Linking ${fromRoomId} to ${fromId} and ${toRoomId} to ${toId}`);

		newRoomToDoors[fromRoomId].push(fromId);
		newRoomToDoors[toRoomId].push(toId);

		newDoorToDoor[fromId] = toId;
		newDoorToDoor[toId] = fromId;

		setRoomsToDoors(newRoomToDoors);
		setDoorToDoor(newDoorToDoor);
		setUnlinkedRooms(newUnlinks);
	};

	const findFunction = (fromId:string, toId:string) => {
		if (validateFromTo(fromId, toId)) {
			console.log(`Finding path from ${fromId} to ${toId}`);

			let allPaths: string[][] = separatePathTree(findAllPaths(roomToDoors, doorToDoor, fromId, toId));

			console.log(allPaths);

			setFoundPaths(allPaths);
		}
	};

	useEffect(() => {
		setUnlinkedRooms(_.cloneDeep(CFG.doors));

		for (let pair of CFG.auto_add) {
			linkFunction(pair[0], pair[1]);
		}
	}, []);

	return (<>
		<DoorDropDown name="From:"
		              doors={_.keys(unlinkedRooms)}
		              onChange={(doorId:string)=>{linkFromDoorId.current=doorId}}
		/>
		<DoorDropDown name="To:"
		              doors={_.keys(unlinkedRooms)}
		              onChange={(doorId:string)=>{linkToDoorId.current=doorId}}
		/>
		<button onClick={() => {linkFunction(linkFromDoorId.current,linkToDoorId.current)}}>LINK</button>
		<RoomDropDown name="From:"
		              rooms={_.keys(roomToDoors)}
		              onChange={(roomId:string)=>{findFromRoomId.current=roomId}}
		/>
		<RoomDropDown name="To:"
		              rooms={_.keys(roomToDoors)}
		              onChange={(roomId:string)=>{findToRoomId.current=roomId}}
		/>
		<button onClick={()=>{findFunction(findFromRoomId.current,findToRoomId.current)}}>FIND</button>
		<button onClick={saveState}>SAVE</button>
		<button onClick={loadState}>LOAD</button>
		<PathDisplay paths={foundPaths} />
	</>);
}
