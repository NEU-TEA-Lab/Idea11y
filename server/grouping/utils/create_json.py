from collections import defaultdict
# from .ai import generate_title_for_group
from typing import List, Dict, Tuple, Any
import json
import random

from grouping.utils.ai import generate_cluster_summary


def _processing_cluster(cluster_name: str, cluster: Dict[str, List[Dict[str, Any]]]) -> Tuple[str, Dict[str, Dict[str, Any]]]:
    """
    Processes a cluster of groups and items, generating structured data and titles.

    Args:
        cluster_name (str): The name of the cluster.
        cluster (dict): A dictionary where keys are group names and values are lists of items.

    Returns:
        tuple: A tuple containing:
            - cluster_title (str): The generated title for the cluster. Cannot be repeated!
            - cluster_data (dict): A dictionary where keys are group names and values are dictionaries with:
                - "title" (str): The generated title for the group.
                - "content" (dict): A dictionary mapping item IDs to their content.
                - "childrenInfo" (list): A list of tuples containing item ID, x, y, width, and height.
    """

    cluster_data = {}
    cluster_title = cluster_name
    
    # Add debug log
    print(f"Processing cluster with {len(cluster)} groups")
    
    # processing group
    for group_name, items in cluster.items():
        content_dict = {}
        content_list = []
        children_info = []

        # processing item inside the group
        for item in items:
            item_id = item.get('id', 'unknown_id')
            item_content = item.get('content', 'No content available')
            item_x, item_y = item.get('x', 0), item.get('y', 0)
            item_w, item_h = item.get('width', 0), item.get('height', 0)
            item_relative_to = item.get('relativeTo')

            content_dict[item_id] = item_content
            content_list.append(item_content)

            item_info = {
                'id': item_id,
                'x': item_x,
                'y': item_y,
                'width': item_w,
                'height': item_h,
                'relativeTo': item_relative_to
            }
            children_info.append(item_info)

        # New: Generate AI summary for the group
        ai_summary = generate_cluster_summary(group_name, content_list) #"AI Summary"  #

        # Use group_name instead of generated title as the key
        cluster_data[group_name] = {
            "title": f"Group {group_name}",  # Or keep original group name
            "content": content_dict,
            "childrenInfo": children_info,
            "aiSummary": ai_summary
        }

    if "untitled" in cluster_name.lower():
        # For now, just use a simple naming scheme
        cluster_title = f"Unbounded Region -{str(random.randint(1, 100))}"

    return cluster_title, cluster_data


def create_complex_json(data_map: defaultdict) -> Dict[str, Any]:
    """
    Creates a complex JSON structure from a data map of clusters. Each cluster is processed
    using the `processing_cluster` function to generate structured data for the cluster and its children.

    Args:
        data_map (defaultdict): A defaultdict containing clusters of data.
        Each key represents a cluster name, and the value is a dictionary containing:
            - 'children': A dictionary of group names and associated items (list of dicts).
            - 'parentInfo': Information about the parent cluster (position, size, etc.).

    Returns:
        dict: A nested dictionary representing the processed complex JSON structure.
        Each key is a cluster title, and the value contains:
            - 'children': The processed group data for that cluster.
            - 'parentInfo': The information about the parent cluster.
    """
    complex_json = {}
    for cluster_name in data_map:
        # process cluster
        # Debug logs
        print(f"Processing cluster: {cluster_name}")
        cluster = data_map[cluster_name]
        children = cluster['children']
        print(f"Children for {cluster_name}:", len(children))
        cluster_title, cluster_json = _processing_cluster(cluster_name, children)
        # store processed cluster in result
        complex_json[cluster_title] = {
            'children': cluster_json,
            'parentInfo': cluster['parentInfo']
        }

    return complex_json
