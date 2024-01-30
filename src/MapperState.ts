import {CFG} from './AllRooms.js';

export interface MapperState {
	roomToDoors: Record<string, string[]>,
	doorToDoor: Record<string, string>,
	unlinkedDoors: Record<string, string>
}

export function getUpdatedState(fromTo: string[2][], oldState: MapperState)
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

