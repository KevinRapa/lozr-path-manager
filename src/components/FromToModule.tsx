import React from 'react';
import {DropDown} from './DropDown';
import {useRef} from 'react';

import '../common.css';
import './FromToModule.css';

interface FromToModuleProps {
	idToNameMapFrom: Record<string, string>
	idToNameMapTo: Record<string, string>
	onClick: (fromTo: [string, string]) => void
	onUnlink?: (fromTo: [string, string]) => void
	buttonTitle: string
	title: string
}

export function FromToModule(props: FromToModuleProps)
{
	const fromId = useRef<string|null>(null);
	const toId = useRef<string|null>(null);
	const toUnlink = useRef<[string,string]|null>(null);
	const linkedPairs = useRef<Record<string,string>>({});

	const fromChange = (id: string) => {
		fromId.current = id;
	};
	const toChange = (id: string) => {
		toId.current = id;
	};
	const onUnlinkSelect = (id: string) => {
		console.log(`will unlink ${id}`);
		let pair: [string, string] = ["", ""];
		let split: string[] = id.split("=>");

		if (split.length == 2) {
			pair[0] = split[0];
			pair[1] = split[1];
		}

		toUnlink.current = pair;
	};
	const onUnlink = () => {
		if (toUnlink.current && props.onUnlink) {
			props.onUnlink(toUnlink.current!);
			toUnlink.current = null;
		}
	};

	const onClick = () => {
		if (!fromId.current || !toId.current) {
			console.log(`Both selections must be defined [${fromId.current}, ${toId.current}]`);
			return;
		}
		if (fromId.current === toId.current) {
			console.log(`FROM and TO cannot be the same [${fromId.current}, ${toId.current}]`);
			return;
		}

		// It is guaranteed that this pair will be linked from here - no more error-checking is done
		let fromName: string = props.idToNameMapFrom[fromId.current];
		let toName: string = props.idToNameMapTo[toId.current];
		let linkId: string = fromId.current + "=>" + toId.current;

		linkedPairs.current[linkId] = fromName + " => " + toName;
		props.onClick([fromId.current, toId.current]);
		fromId.current = null;
		toId.current = null;
	};

	return <div className="from-to-container">
		<div className="from-to-title title">{props.title}</div>
		<DropDown className="from-to-dropdown from-to-dropdown-from"
		          idToNameMap={props.idToNameMapFrom}
		          onChange={fromChange}
		          title={"From:"}
		/>
		<DropDown className="from-to-dropdown from-to-dropdown-to"
		          idToNameMap={props.idToNameMapTo}
		          onChange={toChange}
		          title={"To:"}
		/>
		<button className="from-to-button link-button title" onClick={onClick}>
			{props.buttonTitle}
		</button>
		{ props.onUnlink ? <>
			<DropDown className="from-to-dropdown from-to-dropdown-unlink"
				  idToNameMap={linkedPairs.current}
				  onChange={onUnlinkSelect}
				  title={"Now linked:"}
			/>
			<button className="from-to-button unlink-button title" onClick={onUnlink}>
				{"UNLINK"}
			</button>
		  </> : <></> }
	</div>;
}
