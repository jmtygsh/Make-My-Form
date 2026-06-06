import React from 'react'
import { Trash, Plus, GripVertical } from 'lucide-react'

const Formbuilder = ({ title }: { title: string }) => {
    return (
        <div className="w-full flex flex-col gap-2">
            {/* Tally-like block insertion row */}
            <div className="group flex items-start gap-2 w-full">
                {/* Left Actions (Trash, Plus, Drag Handle) */}
                <div className="flex items-center gap-1 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-gray-700 transition-colors" aria-label="Delete block">
                        <Trash className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    </button>
                    <button className="p-1 hover:text-gray-700 transition-colors" aria-label="Add block">
                        <Plus className="w-[20px] h-[20px]" strokeWidth={1.5} />
                    </button>
                    <div
                        className="p-1 hover:bg-gray-100 hover:text-gray-700 rounded cursor-grab transition-colors flex items-center justify-center"
                        aria-label="Drag to move"
                    >
                        <GripVertical className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Type '/' to insert blocks"
                        className="w-full outline-none border-none bg-transparent text-[17px] text-gray-800 placeholder:text-gray-400 py-1"
                    />
                </div>
            </div>
        </div>
    )
}

export default Formbuilder