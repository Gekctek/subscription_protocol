import { Accessor, Component, createEffect, createSignal, For, JSX, ResourceReturn, Show } from 'solid-js'

type ItemStore = {
    items: Accessor<any[]>;
    getMore: () => boolean;
};

export type Props = {
    store: ItemStore,
    renderSlide: (v: any, index: number) => JSX.Element,
    endSlide: JSX.Element
}


const Swiper: Component<Props> = (props: Props) => {
    const [cursorXStart, setCursorXStart] = createSignal<number>(0);
    const [previousXOffsetPercent, setPreviousXOffsetPercent] = createSignal<number>(0);
    const [xOffsetPercent, setXOffsetPercent] = createSignal<number>(0);
    const [index, setIndex] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);

    createEffect(() => {
        if (!props.store.items()) {
            return;
        }
        if (index() + 1 >= props.store.items().length) {
            let isMore = props.store.getMore(); // TODO
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
        let newIndex = null;
        if (xOffset >= .25) {
            newIndex = index() - 1;
        } else if (xOffset < .25 && xOffset > -.25) {
            let momentum = xOffset - previousXOffsetPercent();
            if (momentum < -.01) {
                newIndex = index() + 1;
            } else if (momentum > .01) {
                newIndex = index() - 1;
            }
        } else if (xOffset < -.25) {
            newIndex = index() + 1;
        }
        if (newIndex != null && newIndex >= 0 && newIndex <= props.store.items().length) {
            setIndex(newIndex);
        }
        setXOffsetPercent(0);
        setIsDragging(false);
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