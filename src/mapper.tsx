import React from 'react';
import {useState,useEffect,useRef} from 'react';
import {CFG} from './AllRooms.js';
import {PathDisplay} from './components/PathDisplay.tsx';
import {FromToModule} from './components/FromToModule.tsx';
import {AdultChildButtons,LinkState} from './components/AdultChildButtons.tsx';
import {MapperState,getUpdatedState,validateFromTo} from './MapperState.ts';
import {findAllPaths, separatePathTree} from './util/FindAllPaths.ts';
import {loadJson, saveJson} from './util/io.ts';
import _ from 'lodash';

export function Mapper()
{
	const [mapperState, setMapperState] = useState<MapperState>({
		unlinkedDoors: CFG.doors,
		roomToDoors: {},
		doorToDoor: {}
	});
	const [foundPaths, setFoundPaths] = useState<string[][]>([]);
	const linkState = useRef<LinkState>("CHILD");

	const linkFunction = (fromId:string, toId:string) => {
		setMapperState(getUpdatedState([[fromId, toId]], mapperState));
	};

	const findFunction = (fromId:string, toId:string) => {
		if (validateFromTo(fromId, toId)) {
			setFoundPaths(separatePathTree(findAllPaths(mapperState.roomToDoors,
			                                            mapperState.doorToDoor,
			                                            fromId, toId,
			                                            linkState.current==="CHILD")));
		}
	};

	const getSelectableRooms = () => {
		return _.keys(mapperState.roomToDoors)
		        .filter(room => !CFG.no_add.includes(room));
	};

	useEffect(() => {
		setMapperState(getUpdatedState(CFG.auto_add, mapperState));
	}, []);

	return <>
		<AdultChildButtons initialState={linkState.current}
		                   onChange={(state:string)=>{linkState.current=state}}
		/>
		<FromToModule entries={_.keys(mapperState.unlinkedDoors)}
		              onClick={linkFunction}
		              idToNameMap={CFG.doors}
		              buttonTitle={"LINK"}
		/>
		<FromToModule entries={getSelectableRooms()}
		              onClick={findFunction}
		              idToNameMap={CFG.areas}
		              buttonTitle={"FIND"}
		/>
		<button onClick={()=>saveJson(JSON.stringify(mapperState), 'lozr-cfg.json')}>SAVE</button>
		<button onClick={()=>loadJson(setMapperState)}>LOAD</button>
		<PathDisplay paths={foundPaths} />
	</>;
}
