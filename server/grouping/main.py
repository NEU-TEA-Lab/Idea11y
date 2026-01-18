from collections import defaultdict
from typing import List, Dict, Tuple, Any, Callable
from .proximity_grouping import group_sticky_notes_by_proximity
from .color_grouping import group_sticky_notes_by_color
from .utils.shape import is_shape_inside_rectangle, is_shape_inside_ellipse
import random


def get_children(data: List[Dict[str, Any]], child_ids: List[str]) -> List[Dict[str, Any]]:
    return [child for child in data if child.get('id') in child_ids]


def group_by_strategy(items: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
    proximity_groups = group_sticky_notes_by_proximity(items)
    if len(proximity_groups) == 1:
        print("Performed complex Color Grouping")
        return group_sticky_notes_by_color(items)
    print("Performed complex Proximity Grouping")
    # print("Proximity groups:", proximity_groups)
    return proximity_groups


def process_item(item: Dict[str, Any], data: List[Dict[str, Any]],
                 is_inside_func: Callable) -> Tuple[str, List[List[Dict[str, Any]]]]:
    parent_id = item.get('id', '')
    outer_x, outer_y = item.get('x', 0), item.get('y', 0)
    outer_w, outer_h = item.get('width', 0), item.get('height', 0)
    shapes_inside = [
        shape for shape in data
        if shape != item and is_inside_func(outer_x, outer_y, outer_w, outer_h,
                                            shape.get('x', 0), shape.get('y', 0),
                                            shape.get('width', 0), shape.get('height', 0))
    ]
    return item.get('type', ''), parent_id, outer_x, outer_y, outer_h, outer_w, group_by_strategy(shapes_inside)


def process_frame(item: Dict[str, Any], data: List[Dict[str, Any]]) -> Tuple[str, List[List[Dict[str, Any]]]]:
    # parent information
    parent_id = item.get('id', '')
    parent_x, parent_y = item.get('x', 0), item.get('y', 0)
    parent_w, parent_h = item.get('width', 0), item.get('height', 0)
    title = item.get('title', '')
    if not title:
        title = f'untitled-{str(random.randint(1, 100))}'
    # children information
    child_ids = item.get('childrenIds', [])
    children = get_children(data, child_ids)
    return title, parent_id, parent_x, parent_y, parent_w, parent_h, group_by_strategy(children)


def get_process_function(item: Dict[str, Any]) -> Callable:
    if item.get('type') == 'frame' and item.get('childrenIds'):
        return process_frame
    elif item.get('type') == 'shape':
        shape_type = item.get('shape')
        if shape_type in ('round_rectangle', 'rectangle'):
            return lambda i, d: process_item(i, d, is_shape_inside_rectangle)
        elif shape_type == 'circle':
            return lambda i, d: process_item(i, d, is_shape_inside_ellipse)
    return lambda *args: (None, '', 0, 0, 0, 0, [])


def perform_grouping(data: List[Dict[str, Any]]) -> Dict[str, List[List[Dict[str, Any]]]]:
    try:
        # Check if there are any sticky notes on the board
        sticky_notes = [item for item in data if item.get('type') == 'sticky_note']
        frames = [item for item in data if item.get('type') == 'frame']
        if not sticky_notes and not frames:
            return {}
        
        bounded_region_map = defaultdict(list)
        items_in_bounded_regions = set()

        for item in data:
            process_func = get_process_function(item)
            title, parent_id, parent_x, parent_y, parent_w, parent_h, groups = process_func(item, data)
            if title:
                bounded_region_map[title] = {}
                bounded_region_map[title]['children'] = groups
                bounded_region_map[title]['parentInfo'] = {
                    'id': parent_id,
                    'x': parent_x,
                    'y': parent_y,
                    'width': parent_w,
                    'height': parent_h
                }
                items_in_bounded_regions.add(parent_id)

                for k, v in groups.items():
                    for child in v:
                        items_in_bounded_regions.add(child['id'])

        if not bounded_region_map:
            print("No bounded regions found. Performing grouping on entire dataset.")
            groups = group_by_strategy(data)
            return {'untitled':
                    {'children': groups, 'parentInfo': ''},
                    }
        else:
            remaining_items = [item for item in data if item.get('id') not in items_in_bounded_regions]
            bounded_region_map["untitled"] = {}
            bounded_region_map["untitled"]['children'] = group_by_strategy(remaining_items)
            bounded_region_map["untitled"]['parentInfo'] = ''

        print("Performed Bounded Region Grouping")
        return dict(bounded_region_map)

    except Exception as e:
        print(f"An error occurred during grouping: {str(e)}")

# TODO: Consider nested bounded regions
# TODO: Group items outside bounded regions separately
