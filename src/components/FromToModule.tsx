import {DropDown} from './DropDown.tsx';
import {useRef} from 'react';

interface FromToModuleProps {
	fromIds: string[],
	toIds: string[],
	onClick: (fromLoc: string, toLoc: string) => void,
	buttonTitle: string,
	idToNameMapFrom: Record<string, string>
	idToNameMapTo: Record<string, string>
}

export function FromToModule(props: FromToModuleProps)
{
	const fromLoc = useRef<string|null>(null);
	const toLoc = useRef<string|null>(null);

	const fromChange = (entry: string) => {
		fromLoc.current = entry;
		console.log(`Setting FROM to ${entry}`);
	};
	const toChange = (entry: string) => {
		toLoc.current = entry;
		console.log(`Setting TO to ${entry}`);
	};
	const onClick = () => {
		console.log(`FromToModule ${props.buttonTitle}, ${fromLoc.current}, ${toLoc.current}`);
		props.onClick(fromLoc.current, toLoc.current);
	};

	return <>
		<span>{"From:"}</span>
		<DropDown ids={props.fromIds}
		          idToNameMap={props.idToNameMapFrom}
		          onChange={fromChange}
		/>
		<span>{"To:"}</span>
		<DropDown ids={props.toIds}
		          idToNameMap={props.idToNameMapTo}
		          onChange={toChange}
		/>
		<button onClick={onClick}>
			{props.buttonTitle}
		</button>
	</>;
}
