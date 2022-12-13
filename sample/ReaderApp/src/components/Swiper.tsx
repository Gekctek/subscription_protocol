import { Accessor, Component, createEffect, createSignal, For, JSX, Resource, ResourceReturn, Show } from 'solid-js'
import { FeedItem } from '../api/FeedActor';

export type SwiperStore = {
    items: Resource<FeedItem[]>;
    allItemsRetrieved: Accessor<boolean>;
    triggerGetMore: () => void;
};

export type FeedItemWithIndex = { index: number } & FeedItem;

export type Props = {
    store: SwiperStore,
    renderSlide: (v: any, index: number) => JSX.Element,
    endSlide: JSX.Element,
    onChange: (activeItem: FeedItemWithIndex | undefined, previousItem: FeedItemWithIndex | undefined) => void;
}


const Swiper: Component<Props> = (props: Props) => {
    const [cursorXStart, setCursorXStart] = createSignal<number>(0);
    const [previousXOffsetPercent, setPreviousXOffsetPercent] = createSignal<number>(0);
    const [xOffsetPercent, setXOffsetPercent] = createSignal<number>(0);
    const [index, setIndex] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);

    createEffect(() => {
        let itemList = props.store.items();
        if (!itemList) {
            return;
        }
        // If there are only X items left, get more items with an async call
        // Then the `store.items()` will update
        let shouldGetMore = itemList.length - index() < 3 && !props.store.allItemsRetrieved;
        if (shouldGetMore) {
            props.store.triggerGetMore();
        }
    })



    const onStart = (e: TouchEvent) => {
        moveStart(e)
    };
    const onMove = (e: TouchEvent) => {
        move(e)
    };
    const onEnd = (e: TouchEvent) => {
        moveEnd();
    };


    const moveStart = (e: TouchEvent) => {
        let cursorX: number = 0;
        if (e.touches) {
            if (!e.touches[0]) {
                throw new Error('touch is not find')
            }
            cursorX = e.touches[0].clientX
        }

        setCursorXStart(parseFloat(cursorX.toFixed(2)));
    };
    const move = (e: TouchEvent) => {

        let cursorX: number = 0
        if (e.touches) {
            if (!e.touches[0]) {
                throw new Error('touch is not find')
            }
            cursorX = e.touches[0].clientX;
        }

        cursorX = parseFloat(cursorX.toFixed(2));
        const tX: number = parseFloat((cursorX - cursorXStart()).toFixed(2));

        if (!isDragging()) {
            // If not dragging, don't drag until it reaches a certain point
            if (Math.abs(tX) < 10) {
                return;
            }
            setIsDragging(true);
        }

        setPreviousXOffsetPercent(xOffsetPercent());
        const width = e.view?.innerWidth ?? 0;
        setXOffsetPercent(tX / width);
    };
    const moveEnd = () => {
        let xOffset = xOffsetPercent();
        let currentIndex = index();
        let newIndex;
        if (xOffset >= .25) {
            newIndex = currentIndex - 1;
        } else if (xOffset < .25 && xOffset > -.25) {
            let momentum = xOffset - previousXOffsetPercent();
            if (momentum < -.01) {
                newIndex = currentIndex + 1;
            } else if (momentum > .01) {
                newIndex = currentIndex - 1;
            }
        } else if (xOffset < -.25) {
            newIndex = currentIndex + 1;
        }
        let itemList = props.store.items() ?? [];
        if (newIndex !== undefined && newIndex >= 0 && newIndex <= itemList.length) {
            setIndex(newIndex);
            let newItem = itemList[newIndex];
            let newItemWithIndex = newItem === undefined
                ? undefined
                : { index: newIndex, ...newItem };
            let currentItem = itemList[currentIndex];
            let currentItemWithIndex = currentItem === undefined
                ? undefined
                : { index: currentIndex, ...currentItem };
            props.onChange(newItemWithIndex, currentItemWithIndex);
        }
        setIsDragging(false);
        setXOffsetPercent(0);
    };


    const translatePercentage = () => {
        let translate = ((index()) * -100) + (xOffsetPercent() * 100);
        if (translate > 0) {
            return 0;
        }
        let min = (props.store.items()?.length ?? 0) * -100;
        if (translate < min) {
            return min;
        }
        return translate;
    };
    return (
        <div
            class="swiper"
            style={{
                transform: `translateX(${translatePercentage()}%)`,
                "transition-duration": isDragging() ? "0ms" : "300ms"
            }}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}>
            <For each={props.store.items()}>
                {(item, index) => (
                    <div class="swiper-slide">
                        {props.renderSlide(item, index())}
                    </div>
                )}
            </For>
            <div class="swiper-slide">
                {props.endSlide}
            </div>
        </div>
    );
}

export default Swiper;