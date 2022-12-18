import { Fab } from '@suid/material';
import { Accessor, Component, createEffect, createSignal, For, JSX, Resource, ResourceReturn, Show } from 'solid-js'
import { FeedItem } from '../api/FeedActor';
import BackIcon from '@suid/icons-material/ArrowBackIosNew';
import ForwardIcon from '@suid/icons-material/ArrowForwardIos';
import { setUnreadIndex, unreadIndex, unreadItems } from '../common/Feed';

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

const detectIfLargeScreen = () => {
    return window.innerWidth >= 1000;
};

const Swiper: Component<Props> = (props: Props) => {
    const [cursorXStart, setCursorXStart] = createSignal<number>(0);
    const [cursorYStart, setCursorYStart] = createSignal<number>(0);
    const [previousXOffsetPercent, setPreviousXOffsetPercent] = createSignal<number>(0);
    const [xOffsetPercent, setXOffsetPercent] = createSignal<number>(0);
    const [isDragging, setIsDragging] = createSignal(false);
    const [isLargeScreen, setIsLargeScreen] = createSignal(detectIfLargeScreen());
    const [swiperBoxRef, setSwiperBoxRef] = createSignal<HTMLElement | undefined>();
    const [lastTriggerCount, setLastTriggetCount] = createSignal();

    const onResize = () => {
        setIsLargeScreen(detectIfLargeScreen());
    };

    createEffect(() => {
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    })

    createEffect(() => {
        let itemList = props.store.items();
        if (itemList === undefined) {
            return;
        }
        let itemsRemaining = itemList.length - unreadIndex();


        // If there are only X items left, get more items with an async call
        // Then the `store.items()` will update
        // OR
        // Check for more if there are none left
        let minCount = props.store.allItemsRetrieved() ? 0 : 2;

        if (itemsRemaining <= minCount && lastTriggerCount() != itemsRemaining) {
            props.store.triggerGetMore();
            setLastTriggetCount(itemsRemaining);
        }
        else {
            setLastTriggetCount();
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
        let cursorX: number = e.touches[0].clientX;
        let cursorY: number = e.touches[0].clientY;

        setCursorXStart(parseFloat(cursorX.toFixed(2)));
        setCursorYStart(parseFloat(cursorY.toFixed(2)));
    };
    const move = (e: TouchEvent) => {

        let cursorX: number = e.touches[0].clientX;
        let cursorY: number = e.touches[0].clientY;

        cursorX = parseFloat(cursorX.toFixed(2));
        const tX: number = parseFloat((cursorX - cursorXStart()).toFixed(2));

        cursorY = parseFloat(cursorY.toFixed(2));
        const tY: number = parseFloat((cursorY - cursorYStart()).toFixed(2));

        if (!isDragging()) {
            // If not dragging, don't drag until it reaches a certain point
            // Or if scrolling
            if (Math.abs(tX) < 10 || Math.abs(tX) < (Math.abs(tY) * 1.5)) {
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
        let currentIndex = unreadIndex();

        const minOffsetPercent = .25;
        let newIndex;
        if (xOffset >= minOffsetPercent) {
            // If positive, move back
            newIndex = currentIndex - 1;
        } else if (xOffset < minOffsetPercent && xOffset > -minOffsetPercent) {
            // If movement too small, dont change index
            // Unless there is a fast flick
            let momentum = xOffset - previousXOffsetPercent();
            if (momentum < -.01) {
                newIndex = currentIndex + 1;
            } else if (momentum > .01) {
                newIndex = currentIndex - 1;
            }
        } else if (xOffset < -minOffsetPercent) {
            // If positive, move next
            newIndex = currentIndex + 1;
        }

        setXOffsetPercent(0);
        setPreviousXOffsetPercent(0);
        setIsDragging(false);

        gotoIndex(newIndex, currentIndex);
    };

    const gotoIndex = (newIndex: number | undefined, currentIndex: number) => {
        let itemList = props.store.items() ?? [];
        if (newIndex !== undefined && newIndex >= 0 && newIndex <= itemList.length) {
            setUnreadIndex(newIndex);
            let newItem = itemList[newIndex];
            let newItemWithIndex = newItem === undefined
                ? undefined
                : { index: newIndex, ...newItem };
            let currentItem = itemList[currentIndex];
            let currentItemWithIndex = currentItem === undefined
                ? undefined
                : { index: currentIndex, ...currentItem };
            props.onChange(newItemWithIndex, currentItemWithIndex);
            swiperBoxRef()?.scrollTo(0, 0);
        }
    }


    const translatePercentage = () => {
        let translate = ((unreadIndex()) * -100) + (xOffsetPercent() * 100);
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
        <div class="swiper">
            <Show when={isLargeScreen()}>
                <div class='nav-button nav-button-back'>
                    <Show when={unreadIndex() > 0}>
                        <Fab onClick={() => gotoIndex(unreadIndex() - 1, unreadIndex())}>
                            <BackIcon />
                        </Fab>
                    </Show>
                </div>
                <div class='nav-button nav-button-next'>
                    <Show when={unreadIndex() < (unreadItems()?.length ?? 0)}>
                        <Fab onClick={() => gotoIndex(unreadIndex() + 1, unreadIndex())}>
                            <ForwardIcon />
                        </Fab>
                    </Show>
                </div>
            </Show>
            <div class="swiper-box" ref={(e) => setSwiperBoxRef(e)}>
                <div
                    class="swiper-content"
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
                                {props.renderSlide(item, unreadIndex())}
                            </div>
                        )}
                    </For>
                    <div class="swiper-slide">
                        {props.endSlide}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Swiper;