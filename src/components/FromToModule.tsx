import React from 'react';
import {DropDown} from './DropDown';
import {useRef} from 'react';

import '../common.css';
import './FromToModule.css';

interface FromToModuleProps {
	idToNameMapFrom: Record<string, string>
	idToNameMapTo: Record<string, string>
	onClick: (fromTo: [string, string]) => void
	buttonTitle: string
	title: string
}

export function FromToModule(props: FromToModuleProps)
{
	const fromId = useRef<string|null>(null);
	const toId = useRef<string|null>(null);

	const fromChange = (id: string) => {
		fromId.current = id;
	};
	const toChange = (id: string) => {
		toId.current = id;
	};
	const onClick = () => {
		if (fromId.current && toId.current) {
			props.onClick([fromId.current, toId.current]);
			fromId.current = null;
			toId.current = null;
		}
	};

	return <div className="from-to-container">
		<div className="from-to-title title">{props.title}</div>
		<DropDown className="from-to-dropdown from-to-dropdown-top"
		          idToNameMap={props.idToNameMapFrom}
		          onChange={fromChange}
		          title={"From:"}
		/>
		<DropDown className="from-to-dropdown from-to-dropdown-bottom"
		          idToNameMap={props.idToNameMapTo}
		          onChange={toChange}
		          title={"To:"}
		/>
		<button className="from-to-button title" onClick={onClick}>
			{props.buttonTitle}
		</button>
	</div>;
}
