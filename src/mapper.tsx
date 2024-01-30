import React from 'react';
import {useState,useEffect,useRef} from 'react';
import {CFG} from './AllRooms.js';
import {PathDisplay} from './components/PathDisplay.tsx';
import {FromToModule} from './components/FromToModule.tsx';
import {AdultChildButtons,LinkState} from './components/AdultChildButtons.tsx';
import {MapperState,getUpdatedState} from './MapperState.ts';
import {findAllPaths, separatePathTree} from './util/FindAllPaths.ts';
import {loadJson, saveJson} from './util/io.ts';
import _ from 'lodash';

export function Mapper()
{
	const [mapperState, setMapperState] = useState<MapperState>({
		unlinkedDoors: CFG.doors,
		unlinkedWarps: CFG.warps,
		roomToDoors: {},
		doorToDoor: {},
		additionalBegin: {}
	});
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
		return [..._.keys(mapperState.roomToDoors)
		        .filter(room => !CFG.no_add.includes(room))];
	};

	useEffect(() => {
		setMapperState(getUpdatedState(CFG.auto_add, mapperState));
	}, []);

	console.log("Rendering: ");
	console.log(mapperState);

	return <>
		<AdultChildButtons initialState={linkState.current}
		                   onChange={(state:string)=>{linkState.current=state}}
		/>
		<FromToModule fromIds={_.keys(mapperState.unlinkedWarps)}
		              toIds={_.keys(CFG.areas)}
		              onClick={linkWarpFunction}
		              idToNameMapFrom={mapperState.unlinkedWarps}
		              idToNameMapTo={CFG.areas}
		              buttonTitle={"LINK WARP"}
		/>
		<FromToModule fromIds={_.keys(mapperState.unlinkedDoors)}
		              toIds={_.keys(mapperState.unlinkedDoors)}
		              onClick={linkFunction}
		              idToNameMapFrom={CFG.doors}
		              idToNameMapTo={CFG.doors}
		              buttonTitle={"LINK"}
		/>
		<FromToModule fromIds={getSelectableRooms()}
		              toIds={getSelectableRooms()}
		              onClick={findFunction}
		              idToNameMapFrom={CFG.areas}
		              idToNameMapTo={CFG.areas}
		              buttonTitle={"FIND"}
		/>
		<button onClick={()=>saveJson(JSON.stringify(mapperState), 'lozr-cfg.json')}>SAVE</button>
		<button onClick={()=>loadJson(setMapperState)}>LOAD</button>
		<PathDisplay paths={foundPaths} songWarps={mapperState.additionalBegin} />
	</>;
}
