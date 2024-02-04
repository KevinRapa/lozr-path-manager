import React from 'react';
import {DropDown} from './DropDown';
import {useRef} from 'react';

interface FromToModuleProps {
	idToNameMapFrom: Record<string, string>
	idToNameMapTo: Record<string, string>
	onClick: (fromTo: [string, string]) => void
	buttonTitle: string
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

	return <>
		<span>{"From:"}</span>
		<DropDown idToNameMap={props.idToNameMapFrom}
		          onChange={fromChange}
		/>
		<span>{"To:"}</span>
		<DropDown idToNameMap={props.idToNameMapTo}
		          onChange={toChange}
		/>
		<button onClick={onClick}>
			{props.buttonTitle}
		</button>
	</>;
}
