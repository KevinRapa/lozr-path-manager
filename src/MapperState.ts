export interface MapperState {
	roomToDoors: Record<string, string[]>,
	doorToDoor: Record<string, string>,
	unlinkedRooms: Record<string, string>
}

export function validateFromTo(from: string|undefined, to: string|undefined): boolean
{
	if (!from || !to) {
		console.log(`Both selections must be defined [${from}, ${to}]`);
		return false;
	} else if (from === to) {
		console.log("FROM and TO cannot be the same");
		return false;
	}

	return true;
}

export function getUpdatedState(fromTo: string[2][], oldState: MapperState)
{
	let newState: MapperState = _.cloneDeep(oldState);

	for (let pair of fromTo) {
		if (!validateFromTo(pair[0], pair[1])) {
			continue;
		}

		delete newState.unlinkedRooms[pair[0]];
		delete newState.unlinkedRooms[pair[1]];

		let fromRoomId:string = pair[0].split("/")[0];
		let toRoomId:string = pair[1].split("/")[0];

		if (!newState.roomToDoors[fromRoomId]) {
			newState.roomToDoors[fromRoomId] = [];
		}
		if (!newState.roomToDoors[toRoomId]) {
			newState.roomToDoors[toRoomId] = [];
		}

		newState.roomToDoors[fromRoomId].push(pair[0]);
		newState.roomToDoors[toRoomId].push(pair[1]);

		newState.doorToDoor[pair[0]] = pair[1];
		newState.doorToDoor[pair[1]] = pair[0];
	}

	return newState;
}

