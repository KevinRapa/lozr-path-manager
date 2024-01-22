import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {CFG} from './AllRooms.js';
import _ from 'lodash';

interface MapperProps {
	str: string;
}

interface DoorDropdownProps {
	name: string;
	doors: string[];
	onChange: (selectedId: string) => void;
}

interface RoomDropdownProps {
	name: string;
	rooms: string[];
	onChange: (selectedId: string) => void;
}

interface DropDownProps {
	ids: string[];
	idToNameMap: Record<string, string>;
	onChange: (selectedId: string) => void;
}

interface RoomNode {
	roomName: string;
	nextRoomNodes: RoomNode[];
}

function convertIdsToIdNamePairs(ids: string[], idToNameMap: Record<string, string>): string[2][]
{
	return ids.map((id: string): string => {
		return [id, idToNameMap[id]];
	}).sort((p1: string[2], p2: string[2]): number => {
		return p1[1].localeCompare(p2[1]);
	});
}

function DropDown(props: DropDownProps)
{
	const onChange = (e) => {
		console.log(`Clicked ${e.target.value}`);
		props.onChange(e.target.value);
	};

	let dropDownElems: string[2][] = convertIdsToIdNamePairs(props.ids, props.idToNameMap);

	return <select onChange={onChange}> {
		dropDownElems.map((s: string[2]): JSX.Element => {
			return <option key={s[0]} value={s[0]}>{s[1]}</option>;
		})
	} </select>;
}

function DoorDropdown(props: DoorDropdownProps)
{
	return (<>
		<span>{props.name}</span>
		<DropDown ids={props.doors} idToNameMap={CFG.doors} onChange={props.onChange} />
	</>);
}

function RoomDropdown(props: RoomDropdownProps)
{
	return (<>
		<span>{props.name}</span>
		<DropDown ids={props.rooms} idToNameMap={CFG.areas} onChange={props.onChange} />
	</>);
}

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

function findAllPaths(visited: Set<string>,
                      roomToDoors: Record<string, string[]>,
                      doorToDoor: Record<string, string>,
                      start: string,
                      end: string): RoomNode
{
	let roomNode: RoomNode|null = null;

	if (visited.has(start)) {
		return roomNode;
	}

	visited.add(start);

	if (start === end) {
		roomNode = {
			roomName: start,
			nextRoomNodes: []
		};
	} else if (roomToDoors[start] !== undefined) {
		roomNode = {
			roomNode: start,
			nextRoomNodes: []
		};

		for (let fromDoorId of roomToDoors[start]) {
			let toDoorId: string = doorToDoor[fromDoorId];
			let idOfNextRoom: string = toDoorId.split('/')[0];

			let nextRoom: RoomNode =
			    findAllPaths(visited, roomToDoors, doorToDoor,
			                 idOfNextRoom, end);

			if (nextRoom !== null) {
				roomNode.nextRoomNodes.push(nextRoom);
			}
		}

		if (!roomNode.nextRoomNodes.length) {
			roomNode = null;
		}
	}

	visited.delete(start);
	return roomNode;
}

export function Mapper(props: MapperProps)
{
	const [roomToDoors, setRoomsToDoors] = useState({});
	const [doorToDoor, setDoorToDoor] = useState({});
	const [unlinkedRooms, setUnlinkedRooms] = useState({});

	const linkFromDoorId = useRef(undefined);
	const linkToDoorId = useRef(undefined);
	const findFromRoomId = useRef(undefined);
	const findToRoomId = useRef(undefined);

	useEffect(() => {
		setUnlinkedRooms(_.cloneDeep(CFG.doors));
	}, []);

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
		if (!validateFromTo(fromId, toId)) {
			return;
		}

		console.log(`Finding path from ${fromId} to ${toId}`);

		let allPaths: RoomNode = findAllPaths(new Set(), roomToDoors,
		                                      doorToDoor, fromId, toId);

		console.log(allPaths);
	};

	return (<>
		<DoorDropdown name="From:"
		              doors={_.keys(unlinkedRooms)}
		              onChange={(doorId:string)=>{linkFromDoorId.current=doorId}}
		/>
		<DoorDropdown name="To:"
		              doors={_.keys(unlinkedRooms)}
		              onChange={(doorId:string)=>{linkToDoorId.current=doorId}}
		/>
		<button onClick={() => {linkFunction(linkFromDoorId.current,linkToDoorId.current)}}>LINK</button>
		<RoomDropdown name="From:"
		              rooms={_.keys(roomToDoors)}
		              onChange={(roomId:string)=>{findFromRoomId.current=roomId}}
		/>
		<RoomDropdown name="To:"
		              rooms={_.keys(roomToDoors)}
		              onChange={(roomId:string)=>{findToRoomId.current=roomId}}
		/>
		<button onClick={()=>{findFunction(findFromRoomId.current,findToRoomId.current)}}>FIND</button>
	</>);
}
