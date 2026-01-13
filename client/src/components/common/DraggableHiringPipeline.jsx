import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IoAdd, IoClose, IoReorderThree } from 'react-icons/io5';
import Input from './Input';
import Button from './Button';

const SortableStage = ({ id, stage, onStageChange, onRemove, canRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex gap-3 items-center p-4 bg-white border border-primary-200 rounded-lg ${isDragging ? 'shadow-lg z-10' : ''
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-primary-100 rounded transition-colors"
            >
                <IoReorderThree size={20} className="text-primary-500" />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                    placeholder="Stage name (e.g., Technical Interview)"
                    value={stage.stage}
                    onChange={(e) => onStageChange('stage', e.target.value)}
                />
                <Input
                    placeholder="Description (optional)"
                    value={stage.description}
                    onChange={(e) => onStageChange('description', e.target.value)}
                />
            </div>

            {canRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <IoClose size={20} />
                </button>
            )}
        </div>
    );
};

const DraggableHiringPipeline = ({ stages, setStages }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = stages.findIndex((_, i) => `stage-${i}` === active.id);
            const newIndex = stages.findIndex((_, i) => `stage-${i}` === over?.id);
            setStages(arrayMove(stages, oldIndex, newIndex));
        }
    };

    const handleStageChange = (index, field, value) => {
        const updated = [...stages];
        updated[index] = { ...updated[index], [field]: value };
        setStages(updated);
    };

    const addStage = () => {
        setStages([...stages, { stage: '', description: '' }]);
    };

    const removeStage = (index) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-primary-600">
                    Drag stages to reorder them. Each stage represents a step in your hiring process.
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={stages.map((_, i) => `stage-${i}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {stages.map((stage, index) => (
                            <SortableStage
                                key={`stage-${index}`}
                                id={`stage-${index}`}
                                stage={stage}
                                onStageChange={(field, value) => handleStageChange(index, field, value)}
                                onRemove={() => removeStage(index)}
                                canRemove={stages.length > 1}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Button
                type="button"
                variant="secondary"
                onClick={addStage}
                icon={<IoAdd />}
            >
                Add Stage
            </Button>

            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <h4 className="text-sm font-medium text-primary-800 mb-2">Common Hiring Stages:</h4>
                <div className="flex flex-wrap gap-2">
                    {['Resume Screening', 'Aptitude Test', 'Technical Round', 'HR Interview', 'Final Interview', 'Offer Discussion'].map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                                if (!stages.some(s => s.stage === suggestion)) {
                                    setStages([...stages, { stage: suggestion, description: '' }]);
                                }
                            }}
                            className="px-3 py-1 text-xs bg-white border border-primary-300 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                        >
                            + {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DraggableHiringPipeline;
